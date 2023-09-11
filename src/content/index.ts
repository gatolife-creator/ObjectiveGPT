const startButton = document.createElement('button')
startButton.textContent = 'START'
startButton.style.position = 'fixed'
startButton.style.top = '25px'
startButton.style.right = '120px'
startButton.className =
  'btn btn-neutral whitespace-nowrap text-gray-700 shadow-[0px_1px_6px_0px_rgba(0,0,0,0.02)] dark:text-gray-300 md:whitespace-normal'
document.body.appendChild(startButton)
startButton.onclick = () => start(5)

const stopButton = document.createElement('button')
stopButton.textContent = 'STOP'
stopButton.style.position = 'fixed'
stopButton.style.top = '25px'
stopButton.style.right = '50px'
stopButton.className =
  'btn btn-neutral whitespace-nowrap text-gray-700 shadow-[0px_1px_6px_0px_rgba(0,0,0,0.02)] dark:text-gray-300 md:whitespace-normal'
document.body.appendChild(stopButton)
stopButton.onclick = () => stop()

// ---------------------------------------------------------------------------//

let isStopped = false
let report = ''
let lang = 'ja'

const listUpTasks = (command: string) => {
  let tasks: (string | null)[] = []
  let baseCommand = ''
  baseCommand = `
Please list up the tasks you need to do to achieve the goal below.

Rules:
・Answer in ${lang}
・Concrete answer is not needed. Just answer tasks.
・Please be sure to use this format
    ## Tasks
    <Task list would be here using markdown like "1. and 2. ">

Goal:
`
  send((baseCommand + command) as string)

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!document.querySelector('.result-streaming')) {
        tasks = Array.from(getLatestConversation().querySelectorAll('li')).map(
          (elem) => elem.textContent,
        )
        clearInterval(interval)
        resolve(tasks)
      }
    }, 3000)
  })
}

const execTask = async (goal: string, task: string) => {
  let solution = ''
  let baseCommand = ''
  baseCommand = `Please do following task, and you need to follow the rules below:
    
    Rules:
    ・Answer in ${lang}
    ・Please take an account the goal "${goal}"
    ・Please do coding as long as you can
    ・Do not provide abstract answer, but answer with concrete solution and even do the work as long as you can
    ・Please rate your task progress you've done, using following template
        - Does your work get useful literally "right away?" [0 to 10]
        - Is your answer literally "concrete?" [0 to 10]
    ・You "must" use this format:
        ## <Task name would be here>
        ### Solutions
        <Concrete solutions would be here>
        if sample code is needed:
            ### Sample Code
            <Sample code would be here (Provide more concrete code as long as you can)>
        ### Execution Results
        <Execution results would be here>
        ### Possible Risks
        <Possible risks would be here>
        ### Possible Improvements
        <Possible improvements would be here>
        ### Task Progress
        <Display progress bar here. Use "⭐️" to represent 1 point, use "☆" to represent 0 point. Maximum stars count would be 10.>
        <State why you rated it that way>
    Task:
    `
  send(baseCommand + task)

  return new Promise((resolve) => {
    const regenerateButton = document.querySelector('form')!.querySelector('button')
    const interval = setInterval(() => {
      if (
        !document.querySelector('.result-streaming') &&
        regenerateButton?.textContent === 'Regenerate'
      ) {
        console.log(getLatestConversation())
        solution = getLatestConversation().innerHTML as string
        clearInterval(interval)
        resolve(solution)
      } else if (regenerateButton?.textContent !== 'Regenerate') {
        regenerateButton?.click()
      }
    }, 3000)
  })
}

const getLatestConversation = () => {
  const conversations = document.querySelectorAll('.markdown')
  const conversation = conversations[conversations.length - 1]
  return conversation
}

const main = async () => {
  const firstCommand = document.querySelector('textarea')?.textContent as string
  report += firstCommand

  const tasks = (await listUpTasks(firstCommand)) as string[]
  console.log(tasks)
  for (const task of tasks) {
    const solution = await execTask(firstCommand, task)
    console.log(task, solution)
    report += '\n' + task + '\n' + solution
  }
  console.log(report)
}

const start = async (n: number) => {
  for (let i = 0; i < n; i++) {
    if (isStopped) break
    await main()
  }
}

const stop = () => {
  isStopped = true
}

const send = (message: string) => {
  const main = document.querySelector('main') as HTMLElement
  const inputForm = main.querySelector('form') as HTMLFormElement
  const textAreaElement = inputForm.querySelector('textarea') as HTMLTextAreaElement
  textAreaElement.focus()
  textAreaElement.value = message
  textAreaElement.dispatchEvent(new Event('input', { bubbles: true }))
  textAreaElement.dispatchEvent(new Event('change', { bubbles: true }))
  const curSubmitButton: HTMLButtonElement = document.querySelector(
    'textarea ~ button',
  ) as HTMLButtonElement
  curSubmitButton.click()
  setTimeout(() => {
    curSubmitButton.click()
  }, 300)
}

export {}
