import { goto } from '$app/navigation';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { leaveGame } from '$lib/remote/online.remote';
import { getImages } from '$lib/services/serviceHelpers';
import type {
	Database,
	OnlineGame,
	OnlineGuess,
	OnlinePlayer,
	OnlinePlayerWithImage,
	OnlineRound,
	OnlineRoundWithCharacter,
} from '$lib/types/DatabaseTypes';

type OnlineRoomStateArgs = {
	supabase: SupabaseClient<Database>;
	game: OnlineGame;
	players: OnlinePlayerWithImage[];
	rounds: OnlineRoundWithCharacter[];
	guesses: OnlineGuess[];
	currentPlayer: OnlinePlayer;
	userId: User['id'];
};

export class OnlineRoomState {
	private supabase: SupabaseClient<Database>;

	game = $state<OnlineGame>()!;
	players = $state<OnlinePlayerWithImage[]>([]);
	rounds = $state<OnlineRoundWithCharacter[]>([]);
	guesses = $state<OnlineGuess[]>([]);
	currentPlayer = $state<OnlinePlayer>()!;
	userId = $state<User['id']>()!;

	leaving = $state(false);
	redirecting = $state(false);

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

		this.rounds = [
			...this.rounds,
			{
				...round,
				character,
			},
		].toSorted((a, b) => a.round_number - b.round_number);
	}

	updateRound(round: OnlineRound) {
		this.rounds = this.rounds.map(r => {
			if (r.id !== round.id) return r;

			return {
				...round,
				character: r.character,
			};
		});
	}

	deleteRound(roundId: OnlineRound['id']) {
		this.rounds = this.rounds.filter(r => r.id !== roundId);
	}

	addGuess(guess: OnlineGuess) {
		if (this.guesses.some(g => g.id === guess.id)) return;

		this.guesses = [...this.guesses, guess];
	}

	updateGuess(guess: OnlineGuess) {
		this.guesses = this.guesses.map(g => (g.id === guess.id ? guess : g));
	}

	deleteGuess(guessId: OnlineGuess['id']) {
		this.guesses = this.guesses.filter(g => g.id !== guessId);
	}
}
