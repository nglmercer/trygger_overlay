const randomPosition = (width: number, height: number) => {
    const x = Math.floor(Math.random() * (width - 100));
    const y = Math.floor(Math.random() * (height - 100));
    return { x, y };
}
const randomPositionPercent = (width: number, height: number) => {
    const x = Math.floor(Math.random() * 100);
    const y = Math.floor(Math.random() * 100);
    return { x, y };
}
const ArrayPositions = []
async function pregeneratePositions() {
    
}
export { randomPosition, randomPositionPercent }