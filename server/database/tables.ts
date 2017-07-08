import * as mongoose from 'mongoose'

export namespace Tables {
    export function initTables() {
       
    }
}

export namespace TableData {
    function refrence(to: string): {} {
        return { type: String, ref: to }
    }
}