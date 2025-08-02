import test from 'node:test'
import assert from 'node:assert/strict'
import { bot, createTree, type TreeItem } from './index.ts'
import createTreeJSON from './createTree.json' with { type: 'json' }
import { Game } from '../game/index.ts'

test('simple createTree', { skip: true }, async () => {
    const tree = createTree(undefined, 1)
    assert.strictEqual(tree.length, 9)

    const allTrees = tree.reduce((prev, cur) => [...prev, ...(cur.next ?? [])], [] as TreeItem[])
    assert.strictEqual(allTrees.length, 72)

    console.log(tree)
})

test('createTree JSON', () => {
    const json = createTreeJSON as TreeItem[]
    assert.strictEqual(json.length, 9)
    assert.strictEqual(json[0].posibleWins, 14652)
})

test('bot results in draw', async () => {
    const game = new Game()
    game.player1 = bot()
    game.player2 = bot()
    await game.play()
    assert.strictEqual(game.winner, undefined)
})