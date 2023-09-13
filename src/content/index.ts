import {
  startButton,
  textAreaElement,
  regenerateButton,
  resultStreaming,
  latestConversation,
} from './component'

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
      if (!resultStreaming) {
        tasks = Array.from(latestConversation.querySelectorAll('li')).map(
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

const splitTask = async (goal: string, taskTree: TaskTree, duration: number) => {
  let taskTrees: TaskTree[] = []
  let prompt = ''
  prompt = `
Please split this task into small pieces that you can work on right away.
If you cannot split into small pieces, just answer "false."
You "must" answer concrete tasks like coding or documenting.

Rules:
* Answer in ${lang} except for titles
* Please take an account the goal "${goal}"
* Concrete answer is not needed. Just answer tasks
* No abstract tasks like considering, thinking about, etc.
* Please use STRONG imperative sentences in a heavy and oppressive way
* Please be sure to use this format
    If you can split it into small pieces:
        ## Smaller Tasks
        <Concrete task list would be here using markdown like "1. " and "2. ">
    Else if you cannot split it into small pieces:
        false

Task:
${taskTree.name}
`

  send(prompt)
  return new Promise<TaskTree[]>((resolve, reject) => {
    const interval = setInterval(() => {
      if (!resultStreaming) {
        if (latestConversation.textContent?.includes('false')) {
          clearInterval(interval)
          reject("You can't split this task into small pieces")
        }
        console.log(latestConversation)
        taskTrees = Array.from(latestConversation.querySelectorAll('li')).map(
          (elem) => ({ name: elem.textContent, subtask: [] } as TaskTree),
        )
        clearInterval(interval)
        setTimeout(() => {
          resolve(taskTrees)
        }, duration)
      }
    }, 3000)
  })
}

const execTask = async (goal: string, taskTree: TaskTree) => {
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
    ${taskTree}
    `
  send(prompt)

  return new Promise<string>((resolve) => {
    const interval = setInterval(() => {
      if (!resultStreaming && regenerateButton?.textContent === 'Regenerate') {
        solution = latestConversation.innerHTML as string
        clearInterval(interval)
        resolve(solution)
      } else if (regenerateButton?.textContent !== 'Regenerate') {
        regenerateButton?.click()
      }
    }, 3000)
  })
}

const main = async () => {
  const prompt = textAreaElement.textContent as string
  report += prompt

  const taskTrees = await listUpTasks(prompt)
  for (const taskTree of taskTrees) {
    try {
      taskTree.subtask.push(...(await splitTask(prompt, taskTree, 2000)))
      console.log(taskTree)
    } catch (e) {
      console.log(e)
      continue
    }
  }

  for (const taskTree of taskTrees) {
    if (taskTree.subtask.length > 0) {
      report += '\n' + taskTree.name
      for (const subtask of taskTree.subtask) {
        const solution = await execTask(prompt, subtask)
        console.log(subtask, solution)
        report += '\n' + subtask.name + '\n' + solution
      }
    } else {
      for (const subtask of taskTree.subtask) {
        const solution = await execTask(prompt, subtask)
        console.log(subtask, solution)
        report += '\n' + subtask.name + '\n' + solution
      }
    }
    console.log(report)
  }
  console.log(report)
}

const start = async (n: number) => {
  for (let i = 0; i < n; i++) {
    await main()
  }
}

const send = (message: string) => {
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
