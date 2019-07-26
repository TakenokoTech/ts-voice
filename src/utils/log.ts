export function countTime(name: string, func: () => void, b: boolean = false) {
    const startTime = performance.now();
    func();
    const endTime = performance.now();
    if (b) console.log(diffTime(name, startTime, endTime));
}

export function diffTime(name: string, startTime: number, endTime: number = performance.now()) {
    return `${('          ' + name).substr(-10)}: ${endTime - startTime}`;
}
