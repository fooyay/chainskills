const ChainList = artifacts.require("./ChainList.sol");

// test suite
contract('ChainList', function(accounts) {
  let chainListInstance;
  const seller = accounts[1];
  const buyer = accounts[2];
  const articleName1 = "article 1";
  const articleDescription1 = "Description for article 1";
  const articlePrice1 = web3.utils.toBN(10);
  const articleName2 = "article 2";
  const articleDescription2 = "Description for article 2";
  const articlePrice2 = web3.utils.toBN(20);
  let sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  let buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  before("set up contract instance for each test", async () => {
    chainListInstance = await ChainList.deployed();
  });

  it("should be initialized with empty values", async () => {
    const numberOfArticles = await chainListInstance.getNumberOfArticles();

    assert.equal(numberOfArticles.toNumber(), 0, "number or articles must be zero");

    const articlesForSale = await chainListInstance.getArticlesForSale();

    assert.equal(articlesForSale.length, 0, "there shouldn't be any articles for sale");
  });

  // sell a first article
  it("should let us sell a first article", async () => {
    const receipt = await chainListInstance.sellArticle(
      articleName1,
      articleDescription1,
      web3.utils.toWei(articlePrice1, "ether"),
      {from: seller}
    );

    // check event
    assert.equal(receipt.logs.length, 1, "one event should have been triggered");
    assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
    assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
    assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
    assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
    assert.equal(receipt.logs[0].args._price.toString(), web3.utils.toWei(articlePrice1, "ether").toString(), "event article price must be " + web3.utils.toWei(articlePrice1));

    const numberOfArticles = await chainListInstance.getNumberOfArticles();

    assert.equal(numberOfArticles, 1, "number of articles must be one");

    const articlesForSale = await chainListInstance.getArticlesForSale();

    assert.equal(articlesForSale.length, 1, "there must be one article for sale");
    assert.equal(articlesForSale[0].toNumber(), 1, "article id must be 1");

    const article = await chainListInstance.articles(articlesForSale[0]);

    assert.equal(article[0].toNumber(), 1, "article id must be 1");
    assert.equal(article[1], seller, "seller must be " + seller);
    assert.equal(article[2], 0x0, "buyer must be empty");
    assert.equal(article[3], articleName1, "article name must be " + articleName1);
    assert.equal(article[4], articleDescription1, "article name must be " + articleDescription1);
    assert.equal(article[5].toString(), web3.utils.toWei(articlePrice1, "ether").toString(), "article price must be " + web3.utils.toWei(articlePrice1, "ether"));
  });

  // sell a second article
  it("should let us sell a second article", async () => {
    const receipt = await chainListInstance.sellArticle(
      articleName2,
      articleDescription2,
      web3.utils.toWei(articlePrice2, "ether"),
      {from: seller}
    );

    // check event
    assert.equal(receipt.logs.length, 1, "one event should have been triggered");
    assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
    assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
    assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
    assert.equal(receipt.logs[0].args._name, articleName2, "event article name must be " + articleName2);
    assert.equal(receipt.logs[0].args._price.toString(), web3.utils.toWei(articlePrice2, "ether").toString(), "event article price must be " + web3.utils.toWei(articlePrice2));

    const numberOfArticles = await chainListInstance.getNumberOfArticles();
    
    assert.equal(numberOfArticles, 2, "number of articles must be two");

    const articlesForSale = await chainListInstance.getArticlesForSale();

    assert.equal(articlesForSale.length, 2, "there must be two articles for sale");
    assert.equal(articlesForSale[1].toNumber(), 2, "article id must be 2");

    const article = await chainListInstance.articles(articlesForSale[1]);

    assert.equal(article[0].toNumber(), 2, "article id must be 2");
    assert.equal(article[1], seller, "seller must be " + seller);
    assert.equal(article[2], 0x0, "buyer must be empty");
    assert.equal(article[3], articleName2, "article name must be " + articleName2);
    assert.equal(article[4], articleDescription2, "article name must be " + articleDescription2);
    assert.equal(article[5].toString(), web3.utils.toWei(articlePrice2, "ether").toString(), "article price must be " + web3.utils.toWei(articlePrice2, "ether"));
  });

  // buy the first article
  it("should buy an article", async () => {
    const articleId = 1;

    // record balances of seller and buyer before the buy
    sellerBalanceBeforeBuy = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(seller), "ether"));
    buyerBalanceBeforeBuy = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(buyer), "ether"));

    const receipt = await chainListInstance.buyArticle(1, {
      from: buyer,
      value: web3.utils.toWei(articlePrice1, "ether")
    });

    assert.equal(receipt.logs.length, 1, "one event should have been triggered");
    assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should be LogBuyArticle");
    assert.equal(receipt.logs[0].args._id.toNumber(), 1, "article id must be 1");
    assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
    assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be " + buyer);
    assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
    assert.equal(receipt.logs[0].args._price.toString(), web3.utils.toWei(articlePrice1, "ether").toString(), "event article price must be " + web3.utils.toWei(articlePrice1));

    // record balances of buyer and seller after the buy
    sellerBalanceAfterBuy = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(seller), "ether"));
    buyerBalanceAfterBuy = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(buyer), "ether"));

    // check the effect of buy on balances of buyer and seller, accounting for gas
    assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1.toNumber(), "seller should have earned " + articlePrice1 + " ETH");
    assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1.toNumber(), "buyer should have spent " + articlePrice1 + " ETH");

    const articlesForSale = await chainListInstance.getArticlesForSale();

    assert.equal(articlesForSale.length, 1, "there should now be only 1 article left for sale");
    assert.equal(articlesForSale[0].toNumber(), 2, "article 2 should be the only article left for sale");

    const numberOfArticles = await chainListInstance.getNumberOfArticles();

    assert.equal(numberOfArticles.toNumber(), 2, "there should still be 2 articles in total");
  });
});
