
type FieldStructureItem = null | 1 | 2

export type FieldStructure = FieldStructureItem[][]

export type Turn = 1 | 2

type X = number

type Y = number

export type Move = [ X, Y ]

export type Player = (field: Readonly<Field>) => Move | Promise<Move>

export interface State {
    timeToWin: number
    combosToWin: Readonly<Move[][]>
}

export class Field {
    private _startParent: Field

    private _turn: Turn = 1
    get turn(): Readonly<Turn> { return this._turn }

    get width(): Readonly<number> { return this._fieldStructure[0].length }
    get height(): Readonly<number> { return this._fieldStructure.length }
    private _winCombo: number
    get winCombo(): Readonly<number> { return this._startParent?.winCombo ?? this._winCombo }

    private _fieldStructure: FieldStructure
    get fieldStructure(): Readonly<FieldStructure> { return this._fieldStructure }

    private _full: boolean
    get full(): Readonly<boolean> { return this._full }
    private _winner: Turn|null = null
    get winner(): Readonly<Turn|null> { return this._winner }

    private _fieldLog: Field[] = []
    get fieldLog(): Readonly<Field[]> { return this._fieldLog }

    private _moveLog: Readonly<Move>[] = []
    get moveLog(): Readonly<Readonly<Move>[]> { return this._moveLog }

    private _player1log: Readonly<Move>[] = []
    get player1log(): Readonly<Readonly<Move>[]> { return this._player1log }

    private _player2log: Readonly<Move>[] = []
    get player2log(): Readonly<Readonly<Move>[]> { return this._player2log }

    init(width: Readonly<number> = 3, height: Readonly<number> = 3, winCombo: Readonly<number> = 3) {
        if (this._fieldStructure) throw new Error('already initiated')
        if (width < 3 || height < 3 || !Number.isInteger(width) || !Number.isInteger(height)) throw new Error('invalid height/width')
        if (winCombo < 3 || !Number.isInteger(winCombo)) throw new Error('invalid winCombo')
        this._winCombo = winCombo
        this._fieldStructure = new Array(height).fill(new Array(width).fill(null))
    }

    initFromFieldStructure(fieldStructure: FieldStructure, winCombo: Readonly<number> = fieldStructure.length, turn: Turn = 1) {
        if (this._fieldStructure) throw new Error('already initiated')
        if (fieldStructure.length < 3 || fieldStructure[0].length < 3) throw new Error('invalid fieldStructure')
        this._fieldStructure = fieldStructure
        this._winCombo = winCombo
        this._turn = turn
        for (let y = 0; y < this.height; y += 1) {
            for (let x = 0; x < this.width; x += 1) {
                if (this._fieldStructure[x][y]) {
                    const move: Move = [x, y]
                    this._moveLog.push(move)
                    if (this._fieldStructure[x][y] === 1) {
                        this._player1log.push(move)
                    } else {
                        this._player2log.push(move)
                    }
                }
                
            }
        }
    }

    private isValidMove(move: Readonly<Move>): boolean {
        if (move[0] < 0 || move[0] >= this.width || move[1] < 0 || move[1] >= this.height) return false
        if (!Number.isInteger(move[0]) || !Number.isInteger(move[1])) return false
        if (this._fieldStructure[move[0]][move[1]]) return false
        return true
    }

    private calcFull(): void {
        if (this._full) return
        for (let y = 0; y < this.height; y += 1) {
            for (let x = 0; x < this.width; x += 1) {
                if (!this._fieldStructure[x][y]) return
            }
        }
        this._full = true
    }

    private calcWinner(): void {
        if (this._winner || !this._moveLog.length) return
        const move = this._moveLog[this._moveLog.length - 1]
        const turn = this._fieldStructure[move[0]][move[1]] as Turn

        let horizontal = 1
        for (let x = move[0] - 1; x >= 0 && horizontal < this.winCombo && this._fieldStructure[x][move[1]] == turn; x -= 1) horizontal += 1
        for (let x = move[0] + 1; x < this.width && horizontal < this.winCombo && this._fieldStructure[x][move[1]] == turn; x += 1) horizontal += 1
        if (horizontal >= this.winCombo) {
            this._winner = turn
            return
        }

        let vertical = 1
        for (let y = move[1] - 1; y >= 0 && vertical < this.winCombo && this._fieldStructure[move[0]][y] == turn; y -= 1) vertical += 1
        for (let y = move[1] + 1; y < this.height && vertical < this.winCombo && this._fieldStructure[move[0]][y] == turn; y += 1) vertical += 1
        if (vertical >= this.winCombo) {
            this._winner = turn
            return
        }

        let diagonal1 = 1
        for (let x = move[0] - 1, y = move[1] - 1; x >= 0 && y >= 0 && diagonal1 < this.winCombo && this._fieldStructure[x][y] == turn; x -= 1, y -= 1) diagonal1 += 1
        for (let x = move[0] + 1, y = move[1] + 1; x < this.width && y < this.height && diagonal1 < this.winCombo && this._fieldStructure[x][y] == turn; x += 1, y += 1) diagonal1 += 1
        if (diagonal1 >= this.winCombo) {
            this._winner = turn
            return
        }

        let diagonal2 = 1
        for (let x = move[0] - 1, y = move[1] + 1; x >= 0 && y < this.height && diagonal2 < this.winCombo && this._fieldStructure[x][y] == turn; x -= 1, y += 1) diagonal2 += 1
        for (let x = move[0] + 1, y = move[1] - 1; x < this.width && y >= 0 && diagonal2 < this.winCombo && this._fieldStructure[x][y] == turn; x += 1, y -= 1) diagonal2 += 1
        if (diagonal2 >= this.winCombo) {
            this._winner = turn
            return
        }
    }

    toString(): string {
        let result = ''
        for (let y = 0; y < this.height; y += 1) {
            for (let x = 0; x < this.width; x += 1) {
                switch (this._fieldStructure[x][y]) {
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
            if (y < this.height - 1) result += '\n'
        }
        return result
    }

    move(move: Readonly<Move>): Field {
        if (this._winner) throw new Error('game ended with winner')
        if (this._full) throw new Error('game ended with draw')
        if (!this.isValidMove(move)) throw new Error('invalid move')

        const newField = new Field()
        newField._startParent = this._startParent ?? this
        newField._fieldLog = [...this._fieldLog, this]
        newField._moveLog = [...this._moveLog, move]
        newField._fieldStructure = [...this._fieldStructure]
        newField._fieldStructure[move[0]] = [...newField._fieldStructure[move[0]]]
        newField._fieldStructure[move[0]][move[1]] = this.turn
        newField.calcWinner()
        newField.calcFull()
        newField._turn = (this._turn === 1 ? 2 : 1)
        return newField
    }

    findFreeCenter(step: number = 0, center: Move = [Math.floor(this.width / 2), Math.floor(this.height / 2)]): Move {
        if (step > Math.max(this.width / 2, this.height / 2)) throw new Error('full field')
        if (!this._fieldStructure[center[0]][center[1]]) return center
        for (let x = Math.max(0, center[0] - step); x <= center[0] + step && x < this.height; x += 1) {
            for (let y = Math.max(0, center[1] - step); y <= center[1] + step && y < this.height; y += 1) {
                if (!this._fieldStructure[center[0]][center[1]]) return [x, y]
            }
        }
        return this.findFreeCenter(step + 1, center)
    }

    getState(turn: Turn): State {
        if (this._full || this._winner) throw new Error('draw or winner exists')
        throw new Error('todo')
    }
}

export class Game {
    constructor(width = 3, height = 3, winCombo = 3, maxInvalidMoves = 1) {
        this._field = new Field()
        this._field.init(width, height, winCombo)
        this._maxInvalidMoves = maxInvalidMoves
    }
    
    private _field: Field
    get field(): Readonly<Field> { return this._field }
    
    private _maxInvalidMoves: number
    player1?: Player
    private _player1InvalidMoves = 0
    player2?: Player
    private _player2InvalidMoves = 0

    canPlay() {
        return !this.field.winner && !this.field.full
    }

    async playTurn() {
        if (!this.canPlay()) throw new Error('game is over')
        if (this.field.turn == 1) {
            if (!this.player1) throw new Error('no player1')
            if (this._player1InvalidMoves >= this._maxInvalidMoves) throw new Error('player1 max invalid moves')
            while (true) {
                try {
                    const move = await this.player1(this.field)
                    this._field = this._field.move(move)
                    break
                } catch {
                    this._player1InvalidMoves += 1
                    if (this._player1InvalidMoves >= this._maxInvalidMoves) throw new Error('player1 max invalid moves')
                }
            }
        } else {
            if (!this.player2) throw new Error('no player2')
            if (this._player2InvalidMoves >= this._maxInvalidMoves) throw new Error('player2 max invalid moves')
            while (true) {
                try {
                    const move = await this.player2(this.field)
                    this._field = this._field.move(move)
                    break
                } catch {
                    this._player2InvalidMoves += 1
                    if (this._player2InvalidMoves >= this._maxInvalidMoves) throw new Error('player2 max invalid moves')
                }
            }
        }
    }

    async play() {
        while (this.canPlay()) await this.playTurn()
    }
}
