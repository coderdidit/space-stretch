const play = "play"
const move = "move"

export const left = "left"
export const right = "right"
export const up = "up"

const jump = "jump"
const down = "down"
export const stop = "stop"

let prevState = stop
let lastTimeChangeToStop = Date.now()

export const handleMoveToEvent = (move) => {
    if (move == left) {
        window.gameStateMoveLeft()
    } else if (move == right) {
        window.gameStateMoveRight()
    } else if (move == up) {
        window.gameStateMoveUp()
    } else {
        window.gameStateStop()
    }
}

window.gameStateInit = () => {
    window.gameState = stop
}

window.gameLeftMove = () => {
    return window.gameState == left
}

window.gameRightMove = () => {
    return window.gameState == right
}

window.gameUpMove = () => {
    return window.gameState == up
}

window.gameJumpMove = () => {
    return window.gameState == jump
}

window.gameDownMove = () => {
    return window.gameState == down
}

window.gameStateMove = () => {
    prevState = window.gameState
    window.gameState = move
}

window.gameStateMoveLeft = () => {
    prevState = window.gameState
    window.gameState = left
}

window.gameStateMoveRight = () => {
    prevState = window.gameState
    window.gameState = right
}

window.gameStateMoveUp = () => {
    prevState = window.gameState
    window.gameState = up
}

window.gameStateMoveDown = () => {
    prevState = window.gameState
    window.gameState = down
}

window.gameStateMoveJump = () => {
    prevState = window.gameState
    window.gameState = jump
}

window.gameStateStop = () => {
    prevState = window.gameState
    if (prevState == move) {
        lastTimeChangeToStop = Date.now()
    }
    window.gameState = stop
}

window.gameInMove = () => {
    return window.gameState == left || window.gameState == right
}

window.gameStateIsInMove = () => {
    const inMove = window.gameState == left || window.gameState == right
    if (prevState == stop && inMove) {
        const now = Date.now()
        const timeDiff = (now - lastTimeChangeToStop) / 1000
        // if first time just increment
        // otherwise do not increment if it was flickering
        if (window.strechesInSession == 0) {
            window.strechesInSession = window.strechesInSession + 1
            document.getElementById('strech-count-in-session').innerHTML = window.strechesInSession
        } else if (timeDiff >= 0.5) {
            window.strechesInSession = window.strechesInSession + 1
            document.getElementById('strech-count-in-session').innerHTML = window.strechesInSession
        }
    }
    return inMove
}

window.gameStateInit()

window.gameScore = 0
window.strechesInSession = 0
window.totalStrechCount = 0

export default function updatePlayerStats() {
    window.gameScore += 1
    window.totalStrechCount += window.strechesInSession
    if (window.player && window.player.set) {
        window.player.set('score', window.gameScore)
        window.player.set('total_strech_count', window.totalStrechCount)
        window.player.save()
    }
    document.getElementById('user-score').innerHTML = window.gameScore
    document.getElementById('total-strech-count').innerHTML = window.totalStrechCount
}
