import { test } from "vitest";
import { stringifySorted } from "../Requester"
import { expect } from "vitest";
test("stringifySorted should keep the data", async ({ }) => {
    const object1 = {
        c: {
            c1: 3,
            c2: 4,
            c3: [5, 6, 7]
        },
        a: 1,
        b: 2,
    };

    const processed = JSON.parse(stringifySorted(object1));
    expect(processed.c.c1).toBe(3);
    expect(processed.c.c2).toBe(4);
    expect(processed.c.c3[0]).toBe(5);
});