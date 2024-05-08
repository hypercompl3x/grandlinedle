export type Character = Tables<'characters'>;

export type CharacterWithImage = Character & { url: string };

export type Location = Tables<'locations'>;

export type LocationWithImage = Location & { url: string };

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
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
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			change_current_character: {
				Args: Record<PropertyKey, never>;
				Returns: undefined;
			};
			change_current_location: {
				Args: Record<PropertyKey, never>;
				Returns: undefined;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
				Database[PublicTableNameOrOptions['schema']]['Views'])
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
			Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
		? PublicSchema['Enums'][PublicEnumNameOrOptions]
		: never;
