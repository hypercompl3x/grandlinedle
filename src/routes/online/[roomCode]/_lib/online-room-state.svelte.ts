import { goto } from '$app/navigation';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import {
	advanceGameIfReady,
	claimOnlineHost,
	kickOnlinePlayer,
	leaveGame,
} from '$lib/remote/online.remote';
import { getImages, getRoundImages } from '$lib/services/serviceHelpers';
import type {
	Database,
	OnlineGame,
	OnlineGuess,
	OnlineGuessWithCharacter,
	OnlinePlayer,
	OnlinePlayerWithImage,
	OnlineRound,
	OnlineRoundWithCharacterAndImage,
} from '$lib/types/DatabaseTypes';

type OnlineRoomStateArgs = {
	supabase: SupabaseClient<Database>;
	game: OnlineGame;
	players: OnlinePlayerWithImage[];
	rounds: OnlineRoundWithCharacterAndImage[];
	guesses: OnlineGuessWithCharacter[];
	currentPlayer: OnlinePlayer;
	userId: User['id'];
};

export class OnlineRoomState {
	private supabase: SupabaseClient<Database>;

	game = $state<OnlineGame>()!;
	players = $state<OnlinePlayerWithImage[]>([]);
	rounds = $state<OnlineRoundWithCharacterAndImage[]>([]);
	guesses = $state<OnlineGuessWithCharacter[]>([]);
	currentPlayer = $state<OnlinePlayer>()!;
	userId = $state<User['id']>()!;

	leaving = $state(false);
	redirecting = $state(false);
	advancing = $state(false);
	transferringHost = $state(false);
	presenceReady = $state(false);

	kickingPlayerId = $state<number | null>(null);

	currentRound = $derived(this.rounds.find(r => r.round_number === this.game.current_round_number));

	constructor(args: OnlineRoomStateArgs) {
		this.supabase = args.supabase;

		this.game = args.game;
		this.players = args.players;
		this.rounds = args.rounds;
		this.guesses = args.guesses;
		this.currentPlayer = args.currentPlayer;
		this.userId = args.userId;
	}

	async kickToOnline() {
		if (this.redirecting) return;

		this.redirecting = true;

		try {
			await this.supabase.auth.signOut();
			await goto('/online', { replaceState: true });
		} catch (error) {
			console.error('Failed to kick to online:', error);
		} finally {
			this.redirecting = false;
		}
	}

	async leave() {
		if (this.leaving) return;

		this.leaving = true;

		try {
			await leaveGame({ gameId: this.game.id });
			await this.kickToOnline();
		} finally {
			this.leaving = false;
		}
	}

	updateGame(game: OnlineGame) {
		this.game = game;
	}

	async addPlayer(player: OnlinePlayer) {
		if (this.players.some(p => p.id === player.id)) return;

		const [playerWithImage] = await getImages([player], this.supabase, 'icons');

		this.players = [...this.players, playerWithImage].toSorted((a, b) => a.id - b.id);
	}

	updatePlayer(player: OnlinePlayer) {
		this.players = this.players.map(p => {
			if (p.id !== player.id) return p;

			return {
				...player,
				url: p.url,
			};
		});

		if (this.currentPlayer.id === player.id) {
			this.currentPlayer = player;
		}
	}

	deletePlayer(playerId: OnlinePlayer['id']) {
		this.players = this.players.filter(p => p.id !== playerId);

		if (this.currentPlayer.id === playerId) {
			void this.kickToOnline();
		}
	}

	async addRound(round: OnlineRound) {
		if (this.rounds.some(r => r.id === round.id)) return;

		const { data: character, error } = await this.supabase
			.from('characters')
			.select()
			.eq('id', round.character_id)
			.limit(1)
			.single();

		if (error) {
			throw new Error(`Failed to fetch character ${round.character_id}: ${error.message}`);
		}

		if (!character) {
			throw new Error(`Character ${round.character_id} not found for round ${round.id}`);
		}

		const roundWithCharacter = { ...round, character };

		const [roundWithImage] = await getRoundImages([roundWithCharacter], this.supabase);

		this.rounds = [...this.rounds, roundWithImage].toSorted(
			(a, b) => a.round_number - b.round_number,
		);
	}

	updateRound(round: OnlineRound) {
		this.rounds = this.rounds.map(r => {
			if (r.id !== round.id) return r;

			return {
				...round,
				character: { ...r.character, url: r.character.url },
			};
		});
	}

	deleteRound(roundId: OnlineRound['id']) {
		this.rounds = this.rounds.filter(r => r.id !== roundId);
	}

	async addGuess(guess: OnlineGuess) {
		if (this.guesses.some(g => g.id === guess.id)) return;

		const { data: character, error } = await this.supabase
			.from('characters')
			.select('name')
			.eq('id', guess.character_id)
			.limit(1)
			.single();

		if (error) {
			throw new Error(`Failed to fetch character ${guess.character_id}: ${error.message}`);
		}

		if (!character) {
			throw new Error(`Character ${guess.character_id} not found for round ${guess.id}`);
		}

		const guessWithCharacter = { ...guess, character };

		this.guesses = [...this.guesses, guessWithCharacter];
	}

	updateGuess(guess: OnlineGuess) {
		this.guesses = this.guesses.map(g => {
			if (g.id !== guess.id) return g;

			return {
				...guess,
				character: g.character,
			};
		});
	}

	deleteGuess(guessId: OnlineGuess['id']) {
		this.guesses = this.guesses.filter(g => g.id !== guessId);
	}

	advanceGameIfReady = async () => {
		if (this.advancing) return;

		this.advancing = true;

		try {
			await advanceGameIfReady({
				gameId: this.game.id,
			});
		} catch (error) {
			console.error('Failed to advance game:', error);
		} finally {
			this.advancing = false;
		}
	};

	onlinePlayerIds = $state<Set<number>>(new Set());

	setOnlinePlayerIds = (playerIds: number[]) => {
		this.onlinePlayerIds = new Set(playerIds);
		this.presenceReady = true;
	};

	isPlayerOnline = (playerId: number) => {
		return this.onlinePlayerIds.has(playerId);
	};

	claimHost = async (oldHostId: number) => {
		if (this.transferringHost) return;

		this.transferringHost = true;

		try {
			await claimOnlineHost({
				gameId: this.game.id,
				oldHostId,
			});
		} catch (error) {
			console.error('Failed to transfer host:', error);
		} finally {
			this.transferringHost = false;
		}
	};

	kickPlayer = async (playerId: number) => {
		if (this.kickingPlayerId) return;

		this.kickingPlayerId = playerId;

		try {
			await kickOnlinePlayer({
				gameId: this.game.id,
				playerId,
			});
		} catch (error) {
			console.error('Failed to kick player:', error);
		} finally {
			this.kickingPlayerId = null;
		}
	};
}
