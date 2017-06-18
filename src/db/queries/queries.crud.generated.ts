export module CRUD {
    export module Member {
        export module Create {
            export function Single(): string {
                return `INSERT INTO Member ("firstName", "lastName") VALUES ($1, $2);`;
            }
            export function Multiple(count: number): string {
                let insertStatement = `INSERT INTO Member ("firstName", "lastName") VALUES `;
                let values: string[] = [];
                let numberOfParameters = 2;
                for (let i = 1; i <= numberOfParameters * count;) {
                    values.push(`($${i++}, $${i++})`);
                }
                insertStatement += `${values.join(',')};`;
                return insertStatement;
            }
        }
        export module Read {
            export function All(columns: string[]): string {
                return `SELECT ${columns.join(',')} FROM Member;`;
            }
            export function WherePrimaryKey(columns: string[]): string {
                return `SELECT ${columns.join(',')} FROM Member WHERE "memberID" = $1;`;
            }
        }
        export module Update {
            export function WherePrimaryKey(columns: string[]): string {
                let updateStatement = 'UPDATE Member SET ';
                let parameters: string[] = [];
                let i = 0;
                for (; i < columns.length; i++) {
                    parameters.push(`${columns[i]} = $${i + 1}`);
                }
                updateStatement += `${parameters.join(',')} `;
                updateStatement += `WHERE "memberID" = $${i + 1};`;
                return updateStatement;
            }
        }
        export module Delete {
            export function All(): string {
                return `DELETE FROM Member;`;
            }
            export function WherePrimaryKey(): string {
                return `DELETE FROM Member WHERE "memberID" = $1;`;
            }
        }
    }
}