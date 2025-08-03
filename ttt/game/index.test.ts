import test from 'node:test'
import assert from 'node:assert/strict'
import { Game } from './index.ts'

test('simple tic tac game horizontal', async () => {
    const game = new Game()

    const player1turns: Array<[number, number]> = [
        [ 0, 0 ],
        [ 1, 0 ],
        [ 2, 0 ]
    ]
    game.player1 = () => {
        return player1turns.shift() ?? [ 2, 0 ]
    }

    const player2turns: Array<[number, number]> = [
        [ 0, 2 ],
        [ 1, 2 ],
        [ 2, 2 ],
    ]
    game.player2 = () => {
        return player2turns.shift() ?? [ 2, 2 ]
    }

    try {
         await game.play()
    } catch (e) {
        console.log(game.field.toString(), game.field.winner)
        throw e
    }
   

    assert.strictEqual(game.field.winner, 1)

    assert.deepEqual(game.field.fieldStructure, [[ 1, null, 2 ], [ 1, null, 2 ], [ 1, null, null ]])
})

test('simple tic tac game vertical', async () => {
    const game = new Game()

    const player1turns: Array<[number, number]> = [
        [ 0, 0 ],
        [ 0, 1 ],
        [ 0, 2 ]
    ]
    game.player1 = () => {
        return player1turns.shift() ?? [ 2, 0 ]
    }

    const player2turns: Array<[number, number]> = [
        [ 2, 0 ],
        [ 2, 1 ],
        [ 2, 2 ],
    ]
    game.player2 = () => {
        return player2turns.shift() ?? [ 2, 2 ]
    }

    await game.play()

    assert.strictEqual(game.field.winner, 1)

    assert.deepEqual(game.field.fieldStructure, [[ 1, 1, 1 ], [ null, null, null ], [ 2, 2, null ]])
})

test('simple tic tac game diagonal 1', async () => {
    const game = new Game()

    const player1turns: Array<[number, number]> = [
        [ 2, 2 ],
        [ 1, 1 ],
        [ 0, 0 ]
    ]
    game.player1 = () => {
        return player1turns.shift() ?? [ 2, 0 ]
    }

    const player2turns: Array<[number, number]> = [
        [ 0, 1 ],
        [ 1, 0 ],
        [ 2, 1 ],
    ]
    game.player2 = () => {
        return player2turns.shift() ?? [ 2, 2 ]
    }

    await game.play()

    assert.strictEqual(game.field.winner, 1)

    assert.strictEqual(game.field.toString(), 'xo \nox \n  x')
})

test('simple tic tac game diagonal 2', async () => {
    const game = new Game()

    const player1turns: Array<[number, number]> = [
        [ 0, 2 ],
        [ 1, 1 ],
        [ 2, 0 ]
    ]
    game.player1 = () => {
        return player1turns.shift() ?? [ 2, 0 ]
    }

    const player2turns: Array<[number, number]> = [
        [ 0, 1 ],
        [ 1, 0 ],
        [ 2, 1 ],
    ]
    game.player2 = () => {
        return player2turns.shift() ?? [ 2, 2 ]
    }

    await game.play()

    assert.strictEqual(game.field.winner, 1)

    assert.strictEqual(game.field.toString(), ' ox\nox \nx  ')
})

test('simple tic tac game error', async () => {
    const game = new Game()

    const player1turns: Array<[number, number]> = [
        [ 0, 0 ],
    ]
    game.player1 = () => {
        return player1turns.shift() ?? [ 2, 0 ]
    }

    const player2turns: Array<[number, number]> = [
        [ 0, 0 ],
    ]
    game.player2 = () => {
        return player2turns.shift() ?? [ 2, 2 ]
    }

    assert.rejects(async () => await game.play(), /player2/)
})

test('simple tic tac game draw', async () => {
    const game = new Game()

    const player1turns: Array<[number, number]> = [
        [ 1, 1 ],
        [ 0, 2 ],
        [ 2, 1 ],
        [ 0, 0 ],
        [ 1, 0 ]
    ]
    game.player1 = () => {
        return player1turns.shift() ?? [ 2, 0 ]
    }

    const player2turns: Array<[number, number]> = [
        [ 1, 2 ],
        [ 2, 0 ],
        [ 0, 1 ],
        [ 2, 2 ],
    ]
    game.player2 = () => {
        return player2turns.shift() ?? [ 2, 2 ]
    }

    await game.play()

    assert.strictEqual(game.field.winner, null)
    assert.strictEqual(game.field.toString(), 'xxo\noxx\nxoo')
})

