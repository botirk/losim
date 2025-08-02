import { type Field, Game, type Move, type Turn } from "../game/index.ts"
import createTreeJSON from './createTree.json' with { type: 'json' } 

export interface TreeItem {
    field: Field
    move: Move
    turn: Turn
    posibleWins: number
    posibleLoses: number
    nextLose: number
    nextWin: number
    next: TreeItem[]
}

export const createTree = (field: Readonly<Field> = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]], turn: Turn): TreeItem[] => {
    const result: TreeItem[] = []
    for (let y = 0; y < 3; y += 1) {
        for (let x = 0; x < 3; x += 1) {
            const move: Move = [x, y]
            if (!Game.isValidMove(field, move)) continue
            const subresult: TreeItem = {
                field: Game.immutableMove(field, move, turn),
                move,
                turn,
                posibleWins: 0,
                posibleLoses: 0,
                nextLose: 100000,
                nextWin: 100000,
                next: []
            }
            if (Game.winner(subresult.field, turn, move)) {
                subresult.nextWin = 0
                subresult.posibleWins = 1
            } else if (!Game.full(subresult.field)) {
                subresult.next = createTree(subresult.field, turn === 2 ? 1 : 2)
                for (const subsubresult of subresult.next) {
                    subresult.posibleLoses += subsubresult.posibleWins
                    subresult.posibleWins += subsubresult.posibleLoses
                    subresult.nextLose = Math.min(subresult.nextLose, subsubresult.nextWin + 1)
                    subresult.nextWin = Math.min(subresult.nextWin, subsubresult.nextLose + 1)
                }
            }
            result.push(subresult)
        }
    }
    return result
}

export const bot = () =>  {
    let availableSteps = createTreeJSON as TreeItem[]
    return (field: Readonly<Field>, turn: Readonly<Turn>, step: number): Move => {
        if (step > 1) availableSteps = (availableSteps.find(ti => Game.fieldsEqual(field, ti.field))?.next) as TreeItem[]
        const nextStep = availableSteps.reduce((bestStep, step) => {
            if (step.nextWin === 0) {
                if (bestStep.nextWin > 0 || Math.random() < 0.5) {
                    return step
                } else {
                    return bestStep
                }
            }
            if (step.nextLose > bestStep.nextLose) return step
            if (step.posibleWins - step.posibleLoses > bestStep.posibleWins - bestStep.posibleLoses) return step
            return bestStep
        }, availableSteps[0])
        availableSteps = nextStep.next
        return nextStep.move
    }
}