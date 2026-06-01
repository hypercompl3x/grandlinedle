export type Character = Tables<'characters'>;

export type CharacterWithImage = Character & { url: string };

export type Location = Tables<'locations'>;

export type LocationWithImage = Location & { url: string };

export type Crew = Tables<'crews'>;

export type CrewWithImage = Crew & { url: string };

export type Quote = Tables<'quotes'> & { affiliation: Character['affiliation'] };

export type Leaderboard = Tables<'leaderboard'>[];

export type LeaderboardEntry = Tables<'leaderboard'>;

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
					first_saga: string;
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
					first_saga: string;
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
					first_saga?: string;
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
						isOneToOne: true;
						referencedRelation: 'characters';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'game_history_crew_id_fkey';
						columns: ['crew_id'];
						isOneToOne: true;
						referencedRelation: 'crews';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'game_history_location_id_fkey';
						columns: ['location_id'];
						isOneToOne: true;
						referencedRelation: 'locations';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'game_history_quote_id_fkey';
						columns: ['quote_id'];
						isOneToOne: true;
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
					player: string;
					quote: number;
				};
				Insert: {
					classic: number;
					crew: number;
					id?: number;
					location: number;
					player: string;
					quote: number;
				};
				Update: {
					classic?: number;
					crew?: number;
					id?: number;
					location?: number;
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
			create_daily_game: { Args: never; Returns: undefined };
		};
		Enums: {
			[_ in never]: never;
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
		Enums: {},
	},
} as const;
