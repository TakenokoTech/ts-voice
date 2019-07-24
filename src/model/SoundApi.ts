class SoundApi {
    async callapi(sound: number[] = []): Promise<number[] | null> {
        try {
            const high = +$("#highpass").val();
            const low = +$("#lowpass").val();
            const shift = +$("#shift").val();
            // console.log(sound.length)
            const body: { [key: string]: number | number[] } = {};
            body["sound"] = sound;
            if (low > 1) body["lowpass"] = Math.pow(2, low);
            if (high > 1) body["highpass"] = Math.pow(2, high);
            if (shift != 0) body["shift"] = shift;
            const res = await fetch("/link", {
                method: "POST",
                body: JSON.stringify(body)
            });
            const json = await res.json();
            return json.result;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}

export default new SoundApi();
