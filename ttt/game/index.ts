
type FieldItem = undefined | 1 | 2

export type Field = [[ FieldItem, FieldItem, FieldItem ], [ FieldItem, FieldItem, FieldItem ], [ FieldItem, FieldItem, FieldItem ]]

export type Turn = 1 | 2

type X = number

type Y = number

export type Move = [ X, Y ]

export class Game {
    private _field: Field = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]]
    get field(): Readonly<Field> { return this._field }

    private _turn: Turn = 1
    get turn(): Readonly<Turn> { return this._turn }

    get step() { return this.log.length + 1 }

    private _winner: Turn|void
    get winner(): Readonly<Turn|void> { return this._winner }
    
    static winner(field: Readonly<Field>, turn: Readonly<Turn>, move: Readonly<Move>): boolean {
        // calc horizontal
        for (let x = 0, y = move[1]; x <= 3; x += 1) {
            if (x === 3) {
                return true
            } else if (field[x][y] !== turn) {
                break
            }
        }
        // calc vertical
        for (let x = move[0], y = 0; y <= 3; y += 1) {
            if (y === 3) {
                return true
            } else if (field[x][y] !== turn) {
                break
            }
        }
        // calc diagonal 1
        for (let x = 0, y = 0; x <= 3; x += 1, y += 1) {
            if (x === 3) {
                return true
            } else if (field[x][y] !== turn) {
                break
            }
        }
        // calc diagonal 2
        for (let x = 0, y = 2; x <= 3; x += 1, y -= 1) {
            if (x === 3) {
                return true
            } else if (field[x][y] !== turn) {
                break
            }
        }
        // not winner
        return false
    }

    static full(field: Readonly<Field>): boolean {
        for (let y = 0; y < 3; y += 1) {
            for (let x = 0; x <  3; x += 1) {
                if (!field[x][y]) return false
            }
        }
        return true
    }

    private applyTurn(turn: Readonly<Turn>, move: Readonly<Move>): boolean {
        // change field
        this._field[move[0]][move[1]] = turn
        // log
        this.log.push(move)
        // winner
        if (Game.winner(this._field, turn, move)) {
            this._winner = turn
            return true
        }
        // full
        if (Game.full(this._field)) {
            return true
        }
        // more turns
        return false
    }

    maxInvalidMoves = 1
    
    player1?: (field: Readonly<Field>, turn: Readonly<Turn>, step: number) => Move | Promise<Move>
    player2?: (field: Readonly<Field>, turn: Readonly<Turn>, step: number) => Move | Promise<Move>

    static isValidMove(field: Readonly<Field>, move: Readonly<Move>): boolean {
        if (move[0] < 0 || move[0] > 2 || move[1] < 0 || move[1] > 2) return false
        if (field[move[0]][move[1]]) return false
        if (!Number.isInteger(move[0]) || !Number.isInteger(move[1])) return false
        return true
    }

    async play() {
        if (!this.player1) throw new Error('no player1')
        if (!this.player2) throw new Error('no player2')

        let player1InvalidMoves = 0, player2InvalidMoves = 0
        while (true) {
            this._turn = 1
            while (true) {
                const move = await this.player1(this._field, this._turn, this.step)
                if (!Game.isValidMove(this._field, move)) {
                    player1InvalidMoves += 1
                    if (player1InvalidMoves >= this.maxInvalidMoves) throw new Error('player1 got too much invalid moves')
                } else {
                    if (this.applyTurn(this._turn, move)) return
                    break
                }
            }
            
            this._turn = 2;
            while (true) {
                const move = await this.player2(this._field, this._turn, this.step)
                if (!Game.isValidMove(this._field, move)) {
                    player2InvalidMoves += 1
                    if (player2InvalidMoves >= this.maxInvalidMoves) throw new Error('player2 got too much invalid moves')
                } else {
                    if (this.applyTurn(this._turn, move)) return
                    break
                }
            }
        }
    }

    static toString(field: Readonly<Field>) {
        let result = ''
        for (let y = 0; y < 3; y += 1) {
            for (let x = 0; x < 3; x += 1) {
                switch (field[x][y]) {
                    case 1:
                        result += 'x'
                        break
                    case 2:
                        result += 'o'
                        break
                    default:
                        result += ' '
                        break
                }
            }
            if (y < 2) result += '\n'
        }
        return result
    }

    toString() {
        return Game.toString(this._field)
    }

    static immutableMove(field: Readonly<Field>, move: Move, turn: Turn): Field {
        const result: Field = [...field]
        result[move[0]] = [...field[move[0]]]
        result[move[0]][move[1]] = turn
        return result
    }

    static fieldsEqual(field1: Readonly<Field>, field2: Readonly<Field>) {
        for (let y = 0; y < 3; y += 1) {
            for (let x = 0; x <  3; x += 1) {
                if (field1[x][y] != field2[x][y]) return false
            }
        }
        return true
    }

    log: Readonly<Move>[] = []
}
