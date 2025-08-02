
type FieldItem = undefined | 1 | 2

type Field = [[ FieldItem, FieldItem, FieldItem ], [ FieldItem, FieldItem, FieldItem ], [ FieldItem, FieldItem, FieldItem ]]

type Turn = 1 | 2

type X = number

type Y = number

type Move = [ X, Y ]

export class Game {
    private _field: Field = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]]
    get field(): Readonly<Field> { return this._field }

    private _turn: Turn = 1
    get turn(): Readonly<Turn> { return this._turn }

    private _winner: Turn|void
    get winner(): Readonly<Turn|void> { return this._winner }
    
    private applyTurn(turn: Turn, move: Move): boolean {
        // change field
        this._field[move[0]][move[1]] = turn
        // calc horizontal
        for (let x = 0, y = move[1]; x <= 3; x += 1) {
            if (x === 3) {
                this._winner = turn
                return true
            } else if (this.field[x][y] !== turn) {
                break
            }
        }
        // calc vertical
        for (let x = move[0], y = 0; y <= 3; y += 1) {
            if (y === 3) {
                this._winner = turn
                return true
            } else if (this.field[x][y] !== turn) {
                break
            }
        }
        // calc diagonal 1
        for (let x = 0, y = 0; x <= 3; x += 1, y += 1) {
            if (x === 3) {
                this._winner = turn
                return true
            } else if (this.field[x][y] !== turn) {
                break
            }
        }
        // calc diagonal 2
        for (let x = 0, y = 2; x <= 3; x += 1, y -= 1) {
            if (x === 3) {
                this._winner = turn
                return true
            } else if (this.field[x][y] !== turn) {
                break
            }
        }
        // have empty
        for (let y = 0; y < 3; y += 1) {
            for (let x = 0; x <  3; x += 1) {
                if (!this.field[x][y]) return false
            }
        }
        // full
        return true
    }

    maxInvalidMoves = 1
    
    player1?: (field: Readonly<Field>, turn: Readonly<Turn>) => Move | Promise<Move>
    player2?: (field: Readonly<Field>, turn: Readonly<Turn>) => Move | Promise<Move>

    isValidMove(move: Move): boolean {
        if (move[0] < 0 || move[0] > 2 || move[1] < 0 || move[1] > 2) return false
        if (!Number.isInteger(move[0]) || !Number.isInteger(move[1])) return false
        if (this._field[move[0]][move[1]] !== undefined) return false
        return true
    }

    async play() {
        if (!this.player1) throw new Error('no player1')
        if (!this.player2) throw new Error('no player2')

        let player1InvalidMoves = 0, player2InvalidMoves = 0
        while (true) {
            this._turn = 1
            while (true) {
                const move = await this.player1(this._field, this._turn)
                if (!this.isValidMove(move)) {
                    player1InvalidMoves += 1
                    if (player1InvalidMoves >= this.maxInvalidMoves) throw new Error('player1 got too much invalid moves')
                } else {
                    if (this.applyTurn(this._turn, move)) return
                    break
                }
            }
            
            this._turn = 2;
            while (true) {
                const move = await this.player2(this._field, this._turn)
                if (!this.isValidMove(move)) {
                    player2InvalidMoves += 1
                    if (player2InvalidMoves >= this.maxInvalidMoves) throw new Error('player2 got too much invalid moves')
                } else {
                    if (this.applyTurn(this._turn, move)) return
                    break
                }
            }
        }
    }

    log() {
        let result = ''
        for (let y = 0; y < 3; y += 1) {
            for (let x = 0; x < 3; x += 1) {
                switch (this._field[x][y]) {
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
}
