import { Context, h, Schema, Session, sleep } from 'koishi'

export const name = 'shandian'
export const usage = ` 
闪电 创建和加入游戏  
闪电 开始 开始游戏  
闪电 结束 结束游戏  
<small>测试阶段,有意见欢迎提<small/>
`
export interface Config { }

export const Config: Schema<Config> = Schema.object({})


export function apply(ctx: Context) {
  let game = {
  };
  const hitValue = ['♠2', '♠3', '♠4', '♠5', '♠6', '♠7', '♠8', '♠9'];

  ctx.command("闪电","闪电游戏")
    .action(async ({ session }) => {
      if (game[session.channelId] === undefined) {
        game[session.channelId] = {
          players: [session.userId],
          status: "waiting",
        }
        return `══闪电══\n已将[闪电]置于${session.username}(${session.userId})的判定区\n发送“闪电”以加入游戏\n发送“闪电.开始”以开始游戏`;
      } else if (game[session.channelId].status === "waiting") {
        if (game[session.channelId].players.includes(session.userId)) {
          return `${h.at(session.userId)}你已经在游戏中了`;
        } else {
          game[session.channelId].players.push(session.userId)
          let userNames = [];
          for (const userId of game[session.channelId].players) {
            let user = await session.bot.getUser(userId);
            console.log(user);
            userNames.push(user.name);
          }
          console.log(userNames);
          return `${h.at(session.userId)} 加入游戏成功,当前游戏成员:${userNames}`;
        }
      } else {
        return `${h.at(session.userId)} 游戏进行中,请等待`;
      }
    })
    .example('闪电 创建和加入闪电游戏');

  ctx.command("闪电.开始","开始闪电游戏")
    .action(async ({ session }) => {
      if (game[session.channelId] === undefined) {
        return `${h.at(session.userId)} 游戏未开始, 发送“闪电”以创建游戏`;
      } else if (game[session.channelId].status === "waiting") {
        game[session.channelId].status = "playing";
        await gameStart(session);
        delete game[session.channelId];
        return
      } else {
        return `${h.at(session.userId)} 游戏进行中,请等待`;
      }
    })
    .example('创建游戏后可开始游戏');

  ctx.command("闪电.结束","终止闪电游戏")
    .action(async ({ session }) => {
      if (game[session.channelId] === undefined) {
        return `${h.at(session.userId)} 游戏未开始, 发送“闪电”以创建游戏`;
      } else if (game[session.channelId].status === "waiting" || game[session.channelId].status === "playing") {
        delete game[session.channelId];
        return `${h.at(session.userId)} 正在结束游戏..`;
      }
    })
    .example('游戏中随时输入此命令以结束游戏');

  async function gameStart(session: Session) {
    let players = game[session.channelId].players;
    session.send(`══闪电══\n游戏开始\n游戏中随时输入 “闪电 结束” 以结束游戏`)
    session.send(h.image("http://101.132.253.14/wp-content/uploads/2024/10/b9d8b701d19e02521c958348.png"))
    await sleep(2000);
    for (let i = 0; i < players.length; i++) {
      if (game[session.channelId] === undefined) {
        session.send(`已终止游戏`)
        return;
      }
      let playerId = players[i];
      let playerName = (await (session.bot.getUser(playerId))).name
      session.send(`闪电来到了${playerName}的判定区`)
      await sleep(1000);
      session.send(`${playerName}的判定结果是...`)
      await sleep(3000);
      let randPoke = getRandomPoke();
      session.send(`${randPoke}`)
      await sleep(1000);
      if (hitValue.includes(randPoke)) {
        session.send(`${h.at(playerId)} 被劈死了! 游戏结束`)
        return;
      }
      session.send(`${playerName}没有被击中!`)
      await sleep(1000);
      if (i === players.length - 1) {
        i = -1;
      }
    }
  }

  function getRandomPoke() {
    const suits = ['♠', '♥', '♣', '♦'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    let suitsIndex = Math.floor(Math.random() * suits.length);
    let valuesIndex = Math.floor(Math.random() * values.length);

    return suits[suitsIndex] + values[valuesIndex];
  }


}
