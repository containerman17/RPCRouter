import { useEffect, useState } from "react";

const problems = ["down", "lagging", "timing out", "giving errors", "unreachable"];

export default function ProblemFlipper() {
    const [displayedProblem, setDisplayedProblem] = useState(problems[0]); // Pre-fill with the first problem for SSR
    const [isDeleting, setIsDeleting] = useState(false);
    const [problemIndex, setProblemIndex] = useState(0);

    useEffect(() => {
        // console.log(problems.map(p => `Blockchain RPC ${p} again?`).join("\n"));

        let timeoutId: number

        // Determine action based on whether it's deleting or not
        if (isDeleting) {
            if (displayedProblem.length > 0) {
                // Erase characters one by one
                timeoutId = setTimeout(() => {
                    setDisplayedProblem(current => current.slice(0, -1));
                }, 20); // Speed of erasing
            } else {
                // After erasing, move to the next problem
                setIsDeleting(false);
                setProblemIndex(currentIndex => (currentIndex + 1) % problems.length);
            }
        } else {
            if (displayedProblem !== problems[problemIndex]) {
                // Type out the next problem character by character
                timeoutId = setTimeout(() => {
                    setDisplayedProblem(problems[problemIndex].slice(0, displayedProblem.length + 1));
                }, 40); // Speed of typing
            } else {
                // Wait for 2 seconds before starting to erase
                timeoutId = setTimeout(() => {
                    setIsDeleting(true);
                }, 2000);
            }
        }

        return () => clearTimeout(timeoutId);
    }, [displayedProblem, isDeleting, problemIndex]);

    //problem or nbsp (“ ” U+00A0)
    return <span>{displayedProblem || "\u00A0"}</span>;
}
