const development = async (bot) => {

    await bot.telegram.deleteWebhook();
  
    await bot.launch();
  
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  };
  
  export { development };