const startButton = document.createElement('button')
startButton.textContent = 'START'
startButton.style.position = 'fixed'
startButton.style.top = '25px'
startButton.style.right = '120px'
startButton.className =
  'btn btn-neutral whitespace-nowrap text-gray-700 shadow-[0px_1px_6px_0px_rgba(0,0,0,0.02)] dark:text-gray-300 md:whitespace-normal'
document.body.appendChild(startButton)
startButton.onclick = () => start(1)

// ---------------------------------------------------------------------------//

let report = ''
let lang = 'ja'

type TaskTree = {
  name: string
  subtask: TaskTree[]
}

const listUpTasks = (goal: string) => {
  let tasks: TaskTree[] = []
  let prompt = ''
  prompt = `
Please list up the tasks you need to do to achieve the goal below.

Rules:
* Answer in ${lang} except for titles
* Concrete answer is not needed. Just answer tasks.
* Please be sure to use this format
    ## Tasks
    <Task list would be here using markdown like "1. and 2. ">

Goal:
${goal}
`
  send(prompt)

  return new Promise<TaskTree[]>((resolve) => {
    const interval = setInterval(() => {
      if (!document.querySelector('.result-streaming')) {
        tasks = Array.from(getLatestConversation().querySelectorAll('li')).map(
          (elem) =>
            ({
              name: elem.textContent,
              subtask: [],
            } as TaskTree),
        )
        clearInterval(interval)
        resolve(tasks)
      }
    }, 3000)
  })
}

const splitTask = async (goal: string, task: TaskTree) => {
  let tasks: TaskTree[] = []
  let prompt = ''
  prompt = `
Please split this task into small pieces if you can.
If you cannot split into small pieces, just answer "false."
You "must" answer concrete tasks like coding or documenting. No abstract tasks like considering, thinking about, etc.

Rules:
* Answer in ${lang} except for titles
* Please take an account the goal "${goal}"
* Concrete answer is not needed. Just answer tasks
* Please use STRONG imperative sentences
* Please pretend to be a boss who is really strict and order me the tasks
* Please be sure to use this format
    If you can split it into small pieces:
        ## Smaller Tasks
        <Concrete task list would be here using markdown like "1. and 2. ">
    Else if you cannot split it into small pieces:
        false

Task:
${task.name}
`

  send(prompt)
  return new Promise<TaskTree[]>((resolve, reject) => {
    const interval = setInterval(() => {
      if (!document.querySelector('.result-streaming')) {
        if (getLatestConversation().textContent?.includes('false')) {
          clearInterval(interval)
          reject("You can't split this task into small pieces")
        }
        console.log(getLatestConversation())
        tasks = Array.from(getLatestConversation().querySelectorAll('li')).map(
          (elem) => ({ name: elem.textContent, subtask: [] } as TaskTree),
        )
        clearInterval(interval)
        resolve(tasks)
      }
    }, 3000)
  })
}

const execTask = async (goal: string, task: string) => {
  let solution = ''
  let prompt = ''
  prompt = `Please do following task, and you need to follow the rules below:
    
    Rules:
    * You "must" answer in ${lang} except for titles which is marked by "#", "##" and something like that
    * Please take an account the goal "${goal}"
    * Please do coding as long as you can
    * Do not provide abstract answer, but answer with concrete solution and even do the work as long as you can
    * You "must" use this format and other formats are not allowed:
        ## <Task name would be here>
        ### Solutions
        <Concrete solutions would be here>
        if sample code is needed:
            ### Sample Code
            <Sample code would be here (Provide more concrete code as long as you can)>
        ### Possible Risks
        <Possible risks would be here>
    Task:
    ${task}
    `
  send(prompt)

  return new Promise<string>((resolve) => {
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

  const tasks = await listUpTasks(firstCommand)
  console.log(tasks)
  for (const task of tasks) {
    try {
      task.subtask.push(...(await splitTask(firstCommand, task)))
      console.log(task)
    } catch (e) {
      console.log(e)
      continue
    }
    // const solution = await execTask(firstCommand, task)
    // console.log(task, solution)
    // report += '\n' + task + '\n' + solution
  }
  console.log(tasks)
  //   console.log(report)
}

const start = async (n: number) => {
  for (let i = 0; i < n; i++) {
    await main()
  }
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
