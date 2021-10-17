 
function getAnglesBetween(p1, p2, p3) {
    const calcAngle = (y, x) => {
        return Math.atan2(y, x) * 180 / Math.PI
    }
    const p1ToP2X = p2[0] - p1[0]
    const p1ToP2Y = p1[1] - p2[1]

    const p1ToP3X = p1[0] - p3[0]
    const p1ToP3Y = p1[1] - p3[1]
    // p1 to p2 angle, p1 to p3 angle
    return [calcAngle(p1ToP2Y, p1ToP2X), calcAngle(p1ToP3Y, p1ToP3X)]
}

function getAngleBetween(p1, p2) {
    const calcAngle = (y, x) => {
        return Math.atan2(y, x) * 180 / Math.PI
    }
    const p1ToP2X = p2["x"] - p1["x"]
    const p1ToP2Y = p1["y"] - p2["y"]
    return calcAngle(p1ToP2Y, p1ToP2X)
}

export {getAnglesBetween, getAngleBetween}
