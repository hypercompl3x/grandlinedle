export type Character = Tables<'characters'>;
export type CharacterWithImage = Character & { url: string };

export type Location = Tables<'locations'>;
export type LocationWithImage = Location & { url: string };

export type Crew = Tables<'crews'>;
export type CrewWithImage = Crew & { url: string };

export type Quote = Tables<'quotes'> & {
	affiliation: Character['affiliation'];
	bounty: Character['last_bounty'];
};

export type Leaderboard = Tables<'leaderboard'>[];

export type LeaderboardEntry = Tables<'leaderboard'>;

export type OnlineGame = Tables<'online_games'>;
export type OnlinePlayer = Tables<'online_players'>;
export type OnlinePlayerWithImage = OnlinePlayer & { url: string };
export type OnlineRound = Tables<'online_rounds'>;
export type OnlineRoundWithCharacter = OnlineRound & { character: Character };
export type OnlineRoundWithCharacterAndImage = OnlineRound & {
	character: Character & { url: string };
};
export type OnlineGuess = Tables<'online_guesses'>;
export type OnlineGuessWithCharacter = Tables<'online_guesses'> & { character: { name: string } };

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: '14.1';
	};
	graphql_public: {
		Tables: {
			[_ in never]: never;
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			graphql: {
				Args: {
					extensions?: Json;
					operationName?: string;
					query?: string;
					variables?: Json;
				};
				Returns: Json;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	public: {
		Tables: {
			characters: {
				Row: {
					affiliation: string;
					created_at: string;
					devil_fruit: string;
					first_arc: string;
					gender: string;
					haki: string[];
					height_cm: number;
					height_m: number;
					id: number;
					last_bounty: number;
					name: string;
					origin: string;
				};
				Insert: {
					affiliation: string;
					created_at?: string;
					devil_fruit: string;
					first_arc: string;
					gender: string;
					haki: string[];
					height_cm: number;
					height_m: number;
					id?: number;
					last_bounty: number;
					name: string;
					origin: string;
				};
				Update: {
					affiliation?: string;
					created_at?: string;
					devil_fruit?: string;
					first_arc?: string;
					gender?: string;
					haki?: string[];
					height_cm?: number;
					height_m?: number;
					id?: number;
					last_bounty?: number;
					name?: string;
					origin?: string;
				};
				Relationships: [];
			};
			crews: {
				Row: {
					created_at: string;
					id: number;
					name: string;
				};
				Insert: {
					created_at?: string;
					id?: number;
					name: string;
				};
				Update: {
					created_at?: string;
					id?: number;
					name?: string;
				};
				Relationships: [];
			};
			daily_games: {
				Row: {
					character_id: number;
					created_at: string;
					crew_id: number;
					id: number;
					location_id: number;
					quote_id: number;
				};
				Insert: {
					character_id: number;
					created_at?: string;
					crew_id: number;
					id?: number;
					location_id: number;
					quote_id: number;
				};
				Update: {
					character_id?: number;
					created_at?: string;
					crew_id?: number;
					id?: number;
					location_id?: number;
					quote_id?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'game_history_character_id_fkey';
						columns: ['character_id'];
						isOneToOne: false;
						referencedRelation: 'characters';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'game_history_crew_id_fkey';
						columns: ['crew_id'];
						isOneToOne: false;
						referencedRelation: 'crews';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'game_history_location_id_fkey';
						columns: ['location_id'];
						isOneToOne: false;
						referencedRelation: 'locations';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'game_history_quote_id_fkey';
						columns: ['quote_id'];
						isOneToOne: false;
						referencedRelation: 'quotes';
						referencedColumns: ['id'];
					},
				];
			};
			leaderboard: {
				Row: {
					classic: number;
					crew: number;
					id: number;
					location: number;
					location_hard_mode: boolean;
					player: string;
					quote: number;
				};
				Insert: {
					classic: number;
					crew: number;
					id?: number;
					location: number;
					location_hard_mode?: boolean;
					player: string;
					quote: number;
				};
				Update: {
					classic?: number;
					crew?: number;
					id?: number;
					location?: number;
					location_hard_mode?: boolean;
					player?: string;
					quote?: number;
				};
				Relationships: [];
			};
			locations: {
				Row: {
					created_at: string;
					id: number;
					name: string;
				};
				Insert: {
					created_at?: string;
					id?: number;
					name: string;
				};
				Update: {
					created_at?: string;
					id?: number;
					name?: string;
				};
				Relationships: [];
			};
			online_games: {
				Row: {
					created_at: string;
					current_round_number: number;
					guess_time: number;
					id: number;
					number_of_rounds: number;
					room_code: string;
					status: Database['public']['Enums']['online_game_status'];
					sub_status: Database['public']['Enums']['online_game_sub_status'];
					sub_status_started_at: string;
				};
				Insert: {
					created_at?: string;
					current_round_number?: number;
					guess_time?: number;
					id?: number;
					number_of_rounds?: number;
					room_code: string;
					status?: Database['public']['Enums']['online_game_status'];
					sub_status?: Database['public']['Enums']['online_game_sub_status'];
					sub_status_started_at?: string;
				};
				Update: {
					created_at?: string;
					current_round_number?: number;
					guess_time?: number;
					id?: number;
					number_of_rounds?: number;
					room_code?: string;
					status?: Database['public']['Enums']['online_game_status'];
					sub_status?: Database['public']['Enums']['online_game_sub_status'];
					sub_status_started_at?: string;
				};
				Relationships: [];
			};
			online_guesses: {
				Row: {
					character_id: number;
					created_at: string;
					game_id: number;
					guess_number: number;
					id: number;
					player_id: number;
					round_id: number;
				};
				Insert: {
					character_id: number;
					created_at?: string;
					game_id: number;
					guess_number: number;
					id?: number;
					player_id: number;
					round_id: number;
				};
				Update: {
					character_id?: number;
					created_at?: string;
					game_id?: number;
					guess_number?: number;
					id?: number;
					player_id?: number;
					round_id?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'online_guesses_character_id_fkey';
						columns: ['character_id'];
						isOneToOne: false;
						referencedRelation: 'characters';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'online_guesses_game_id_fkey';
						columns: ['game_id'];
						isOneToOne: false;
						referencedRelation: 'online_games';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'online_guesses_player_id_fkey';
						columns: ['player_id'];
						isOneToOne: false;
						referencedRelation: 'online_players';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'online_guesses_round_id_fkey';
						columns: ['round_id'];
						isOneToOne: false;
						referencedRelation: 'online_rounds';
						referencedColumns: ['id'];
					},
				];
			};
			online_players: {
				Row: {
					created_at: string;
					display_name: string;
					game_id: number;
					icon: number;
					id: number;
					is_host: boolean;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					display_name: string;
					game_id: number;
					icon: number;
					id?: number;
					is_host?: boolean;
					user_id: string;
				};
				Update: {
					created_at?: string;
					display_name?: string;
					game_id?: number;
					icon?: number;
					id?: number;
					is_host?: boolean;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'online_players_game_id_fkey';
						columns: ['game_id'];
						isOneToOne: false;
						referencedRelation: 'online_games';
						referencedColumns: ['id'];
					},
				];
			};
			online_rounds: {
				Row: {
					character_id: number;
					created_at: string;
					current_guess_number: number;
					game_id: number;
					id: number;
					round_number: number;
				};
				Insert: {
					character_id: number;
					created_at?: string;
					current_guess_number?: number;
					game_id: number;
					id?: number;
					round_number: number;
				};
				Update: {
					character_id?: number;
					created_at?: string;
					current_guess_number?: number;
					game_id?: number;
					id?: number;
					round_number?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'online_rounds_character_id_fkey';
						columns: ['character_id'];
						isOneToOne: false;
						referencedRelation: 'characters';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'online_rounds_game_id_fkey';
						columns: ['game_id'];
						isOneToOne: false;
						referencedRelation: 'online_games';
						referencedColumns: ['id'];
					},
				];
			};
			quotes: {
				Row: {
					character_id: number;
					created_at: string;
					id: number;
					quote: string;
				};
				Insert: {
					character_id: number;
					created_at?: string;
					id?: number;
					quote: string;
				};
				Update: {
					character_id?: number;
					created_at?: string;
					id?: number;
					quote?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'quotes_character_id_fkey';
						columns: ['character_id'];
						isOneToOne: false;
						referencedRelation: 'characters';
						referencedColumns: ['id'];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			advance_online_game_from_results: {
				Args: { p_game_id: number; p_max_guess_number: number };
				Returns: {
					current_guess_number: number;
					current_round_number: number;
					game_status: Database['public']['Enums']['online_game_status'];
					game_sub_status: Database['public']['Enums']['online_game_sub_status'];
					result: string;
				}[];
			};
			advance_online_game_if_ready: {
				Args: {
					p_game_id: number;
					p_max_guess_number: number;
					p_results_seconds: number;
					p_reveal_seconds: number;
				};
				Returns: {
					current_guess_number: number;
					current_round_number: number;
					game_status: Database['public']['Enums']['online_game_status'];
					game_sub_status: Database['public']['Enums']['online_game_sub_status'];
					result: string;
					sub_status_started_at: string;
				}[];
			};
			create_daily_game: { Args: never; Returns: undefined };
			create_online_game_with_host: {
				Args: { p_display_name: string; p_icon: number };
				Returns: {
					game_id: number;
					player_id: number;
					room_code: string;
				}[];
			};
			reset_online_game_to_lobby: {
				Args: { p_game_id: number };
				Returns: undefined;
			};
			start_online_game: {
				Args: {
					p_game_id: number;
					p_guess_time: number;
					p_number_of_rounds: number;
				};
				Returns: undefined;
			};
			submit_online_guess: {
				Args: {
					p_character_id: number;
					p_guess_number: number;
					p_max_guess_number?: number;
					p_room_code: string;
					p_round_id: number;
				};
				Returns: {
					current_guess_number: number;
					current_round_number: number;
					game_status: Database['public']['Enums']['online_game_status'];
					game_sub_status: Database['public']['Enums']['online_game_sub_status'];
					guess_id: number;
					result: string;
					was_correct: boolean;
				}[];
			};
		};
		Enums: {
			online_game_status: 'lobby' | 'in_game' | 'results';
			online_game_sub_status: 'guessing' | 'revealing' | 'results';
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema['Enums']
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
		? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema['CompositeTypes']
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
		? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	graphql_public: {
		Enums: {},
	},
	public: {
		Enums: {
			online_game_status: ['lobby', 'in_game', 'results'],
			online_game_sub_status: ['guessing', 'revealing', 'results'],
		},
	},
} as const;
