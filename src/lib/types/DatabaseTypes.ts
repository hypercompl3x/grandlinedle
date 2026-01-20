export type Character = Tables<'characters'>;

export type CharacterWithImage = Character & { url: string };

export type Location = Tables<'locations'>;

export type LocationWithImage = Location & { url: string };

export type Quote = Tables<'quotes'>;

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: '12.0.2 (a4e00ff)';
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
			current_character: {
				Row: {
					created_at: string;
					id: number;
				};
				Insert: {
					created_at?: string;
					id?: number;
				};
				Update: {
					created_at?: string;
					id?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'current_character_id_fkey';
						columns: ['id'];
						isOneToOne: true;
						referencedRelation: 'characters';
						referencedColumns: ['id'];
					},
				];
			};
			current_location: {
				Row: {
					created_at: string;
					id: number;
				};
				Insert: {
					created_at?: string;
					id?: number;
				};
				Update: {
					created_at?: string;
					id?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'current_location_id_fkey';
						columns: ['id'];
						isOneToOne: true;
						referencedRelation: 'locations';
						referencedColumns: ['id'];
					},
				];
			};
			current_quote: {
				Row: {
					created_at: string;
					id: number;
				};
				Insert: {
					created_at?: string;
					id?: number;
				};
				Update: {
					created_at?: string;
					id?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'current_quote_id_fkey1';
						columns: ['id'];
						isOneToOne: true;
						referencedRelation: 'quotes';
						referencedColumns: ['id'];
					},
				];
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
			change_current_character: { Args: never; Returns: undefined };
			change_current_location: { Args: never; Returns: undefined };
			change_current_quote: { Args: never; Returns: undefined };
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
