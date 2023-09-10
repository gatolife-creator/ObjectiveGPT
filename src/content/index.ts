const startButton = document.createElement('button')
startButton.textContent = 'START'
startButton.style.position = 'fixed'
startButton.style.top = '25px'
startButton.style.right = '120px'
startButton.className =
  'btn btn-neutral whitespace-nowrap text-gray-700 shadow-[0px_1px_6px_0px_rgba(0,0,0,0.02)] dark:text-gray-300 md:whitespace-normal'
document.body.appendChild(startButton)
// startButton.textContent = 'Start'
// startButton.className = 'btn relative btn-neutral -z-0 whitespace-nowrap border-0 md:border'
// // @ts-ignore
// startButton['as'] = 'button'
// // @ts-ignore
// document.querySelector('form').querySelector('div').firstChild?.firstChild.appendChild(startButton)
startButton.onclick = () => start(5)

const stopButton = document.createElement('button')
stopButton.textContent = 'STOP'
stopButton.style.position = 'fixed'
stopButton.style.top = '25px'
stopButton.style.right = '50px'
stopButton.className =
  'btn btn-neutral whitespace-nowrap text-gray-700 shadow-[0px_1px_6px_0px_rgba(0,0,0,0.02)] dark:text-gray-300 md:whitespace-normal'
document.body.appendChild(stopButton)
// stopButton.textContent = 'Stop'
// stopButton.className = 'btn relative btn-neutral -z-0 whitespace-nowrap border-0 md:border'
// // @ts-ignore
// startButton['as'] = 'button'
// // @ts-ignore
// document.querySelector('form').querySelector('div').firstChild?.firstChild.appendChild(stopButton)
stopButton.onclick = () => stop()

// ---------------------------------------------------------------------------//

let interval: NodeJS.Timer | null = null
let report = ''

const listUpTasks = (command: string) => {
  let tasks: (string | null)[] = []
  let baseCommand = ''
  baseCommand = `
以下の目標を達成するためのタスクを箇条書きにしてください。

ルール:
・簡潔にタスクのみ記述
・詳細な説明は避ける

目標:
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
  baseCommand = `以下のタスクを実行してください。ただし、以下のルールに従うこと:
    
    ルール:
    ・「${goal}」という目標が前提にあることを考慮してください
    ・プログラミングが必要なタスクであるかを判断して下さい
    ・プログラミングが必要なタスクであれば、サンプルコードを提示してください
    ・具体的な解決策を提示してください
    ・タスクの実行結果を示してください

    タスク:
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
  let i = 0
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
  await main()
}

const stop = () => {
  if (interval !== null) {
    clearInterval(interval)
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
