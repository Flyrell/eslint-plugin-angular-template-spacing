import { TSESTree } from '@typescript-eslint/utils';

export interface Interpolation {
    value: string;
    location: TSESTree.SourceLocation;
}

export type IncompleteNode = Omit<Interpolation, 'location'> & { location: Partial<Interpolation['location']> };
