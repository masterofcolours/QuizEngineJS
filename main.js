import QuizEngine from "./src/index.js";

const resultBox = document.querySelector('.result-box')

const questions = [
    {
        id: 1,
        prompt: "What is the most abundant gas in Earth's atmosphere?",
        options: [
            { value: "a", text: "Oxygen" },
            { value: "b", text: "Nitrogen" },
            { value: "c", text: "Carbon Dioxide" },
            { value: "d", text: "Hydrogen" }
        ],
        answer: "b"
    },
    {
        id: 2,
        prompt: "Which element on the periodic table has the chemical symbol 'Au'?",
        options: [
            { value: "a", text: "Silver" },
            { value: "b", text: "Copper" },
            { value: "c", text: "Gold" },
            { value: "d", text: "Aluminum" }
        ],
        answer: "c"
    },
    {
        id: 3,
        prompt: "What is the primary function of mitochondria in eukaryotic cells?",
        options: [
            { value: "a", text: "Energy production (ATP generation)" },
            { value: "b", text: "Protein synthesis" },
            { value: "c", text: "DNA storage" },
            { value: "d", text: "Cell membrane formation" }
        ],
        answer: "a"
    },
    {
        id: 4,
        prompt: "According to Einstein's theory of special relativity, what is the constant 'c'?",
        options: [
            { value: "a", text: "Speed of sound in a vacuum" },
            { value: "b", text: "Gravitational constant" },
            { value: "c", text: "Speed of light in a vacuum" },
            { value: "d", text: "Planck's constant" }
        ],
        answer: "c"
    },
    {
        id: 5,
        prompt: "Which layer of the Earth's atmosphere contains the ozone layer?",
        options: [
            { value: "a", text: "Troposphere" },
            { value: "b", text: "Stratosphere" },
            { value: "c", text: "Mesosphere" },
            { value: "d", text: "Thermosphere" }
        ],
        answer: "b"
    }
];

const container = {
    promptBox: '#prompt',
    indexBox: '#index',
    timerBox: '#timer',
    optionsContainer: '.option-input',
    labels: '.option-label',
    nextButton: '#next-btn',
    previousButton: '#prev-btn',
    selectButton: '#select-btn',
    endButton: '#end-btn'
};

const options = {
    time: { minutes: 4, seconds: 5},
    shuffle: true,
    lockstepMode: true,
    noBacktracking: true
};

function setQuiz() {
    const newQuiz = new QuizEngine(questions, container, options);

    newQuiz.receiveResult("getResult");

    document.addEventListener('getResult', () => {
        const resultArray = newQuiz.result();
        console.log(resultArray);
        
        for(let result of resultArray){
            resultBox.insertAdjacentHTML("beforeend", 
                `
                <div class="result-item" > 
                    <span>
                        Index: ${result[0] + 1}
                    </span> 

                    <span>
                        Correct Answer: ${result[1]}
                    </span>

                    <span>
                        Your Answer: ${result[2] === true ? `✅` : `❌`}
                    </span>

                </div>

            `)
            
        }
    });
    
}

setQuiz()
