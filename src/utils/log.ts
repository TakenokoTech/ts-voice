export function countTime(name: string, func: () => void, b: boolean = false) {
    const startTime = performance.now();
    func();
    const endTime = performance.now();
    if (b) console.log(`${name}: ${endTime - startTime}`);
}
