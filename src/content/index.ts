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

const counter = document.createElement('div')
counter.style.position = 'fixed'
counter.style.width = '140px'
counter.style.height = '140px'
counter.style.top = '70px'
counter.style.right = '50px'
counter.className =
  'text-4xl font-semibold text-center text-white dark:text-gray-600 ml-auto mr-auto mb-10 sm:mb-16 flex gap-2 items-center justify-center flex-grow'
document.body.appendChild(counter)

// ---------------------------------------------------------------------------//

let interval: NodeJS.Timer | null = null

const listUpTasks = (command: string, callback: Function) => {
  let tasks: (string | null)[] = []
  let baseCommand = ''
  baseCommand = `
以下の目標を達成するためのタスクを箇条書きにしてください。
Rules:
・簡潔にタスクのみ記述
・詳細な説明は避ける
`
  send((baseCommand + command) as string)

  setTimeout(() => {
    tasks = Array.from(getLatestConversation().querySelectorAll('li')).map(
      (elem) => elem.textContent,
    )
    callback(tasks)
  }, 10000)
}

const execTask = async (task: string, callback: Function) => {
  let solution = ''
  let baseCommand = ''
  baseCommand = `以下のタスクを実行してください。ただし、以下のルールに従うこと:
    
    ルール:
    ・プログラミングが必要なタスクであるかを判断して下さい
    ・プログラミングが必要なタスクであれば、サンプルコードを提示してください
    ・必要がある場合には、プログラミングを行なってください
    ・具体的な解決策を提示してください

    タスク:

    `
  send(baseCommand + task)

  setTimeout(() => {
    solution = getLatestConversation().textContent as string
    callback(solution)
  })
}

const getLatestConversation = () => {
  const conversations = document.querySelectorAll('[data-testid]')
  const conversation = conversations[conversations.length - 2]
  return conversation
}

const main = () => {
  let i = 0
  const firstCommand = document.querySelector('textarea')?.textContent as string
  const solutions = []

  listUpTasks(firstCommand, (tasks: string) => {
    setInterval(() => {
      if (!document.querySelector('.result-streaming')) {
        i++
        if (i < tasks.length) {
          execTask(tasks[i], (solution: string) => {
            solutions.push(solution)
          })
        }
      }
    }, 3000)
  })
}

const start = async (n: number) => {
  main()
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
