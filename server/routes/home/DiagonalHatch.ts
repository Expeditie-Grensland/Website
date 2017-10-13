import {Option} from "tsoption";


export class DiagonalHatch {
    constructor(
        public readonly color1: string,
        public readonly color2: string,
        public readonly color3: Option<string>
    ) {}

    toString(): string {
        return `DiagonalHatch[color1: ${this.color1}, color2: ${this.color2}, color3: ${this.color3}]`
    }

    getID(): string {
        return this.color1 + this.color2 + (this.color3.isEmpty() ? "" : this.color3.get)
    }

    toSVG(): string { //TODO: three-color hatch
        if(this.color3.isEmpty()) {
            return `
                <pattern id="${this.getID()}" patternUnits="userSpaceOnUse" width="10" height="10">
                    <path d="M-1,1 l2,-2 
                             M0,10 l10,-10 
                             M9,11 l2,-2" 
                          style="stroke:${this.color1}; stroke-width:4" />
                    <path d="M0,5 l5,-5 
                             M5,10 l5,-5" 
                          style="stroke:${this.color2}; stroke-width:4; stroke-linecap: square" />
                </pattern>
                `
        } else {
            return `
                <pattern id="${this.getID()}" patternUnits="userSpaceOnUse" width="10" height="10">
                    <path d="M-1,1 l2,-2 
                             M0,10 l10,-10 
                             M9,11 l2,-2" 
                          style="stroke:${this.color1}; stroke-width:4" />
                    <path d="M0,5 l5,-5 
                             M5,10 l5,-5" 
                          style="stroke:${this.color2}; stroke-width:4; stroke-linecap: square" />
                </pattern>
                `
        }
    }
}

