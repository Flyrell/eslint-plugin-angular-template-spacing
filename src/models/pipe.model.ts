import type { ASTWithSource } from '@angular/compiler';
import type { InterpolationNode } from '@plugin/models/interpolation.model';

export type BoundAttribute = {
    value: ASTWithSource;
    valueSpan: {
        start: {
            col: number;
            line: number;
            offset: number;
        };
        end: {
            col: number;
            line: number;
        };
    };
};

export interface Pipe {
    value: string;
    offset: number;
    startLocation: InterpolationNode['location']['start'];
}
