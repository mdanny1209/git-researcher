// const fetch = require('node-fetch');

async function getRepositories(keyword, language, month) {
    const searchQuery = `q=${keyword}+language:${language}`;
    const searchUrl = `https://api.github.com/search/repositories?${searchQuery}&sort=commits&order=desc`;
  
    const response = await fetch(searchUrl);
    const data = await response.json();
  
    return data.items;
}

const getCommitsLastMonth = async (fullname) => {
    setTimeout(10000)
    const url = `https://api.github.com/repos/${fullname}/stats/commit_activity`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data)
  
    const lastMonthCommits = data.reduce((total, week) => {
      const weekStart = moment.unix(week.week).startOf('week');
      const weekEnd = moment.unix(week.week).endOf('week');
      const isInLastMonth = weekEnd.isAfter(moment().subtract(1, 'month'));
  
      if (isInLastMonth) {
        return total + week.total;
      }
      return total;
    }, 0);
  
    return lastMonthCommits;
  };

function getLastMonthDate() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    return lastMonth.toISOString();
}

// Call the function with the desired keyword and language
async function SearchRepo() {

    var keyword = document.getElementById("searchKey").value;
    var language = document.getElementById("codeLang").value;
    var month = document.getElementById("monNum").value;
    // const repositories = await getRepositories(keyword, language);

    // for (const repo of repositories) {
    //     console.log(repo.full_name)
    //     const commitsLastMonth = await getCommitsLastMonth(repo.full_name);
    //     console.log(`${repo.name}: ${commitsLastMonth} commits in the last month`);
    // }
    const commitsLastMonth = await getCommitsLastMonth("sei-protocol/sei-cosmos");
}