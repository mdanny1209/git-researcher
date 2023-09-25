// const fetch = require('node-fetch');
const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

var repoInfo = []

const sleepTime = 5000

async function getRepositories(keyword, language, page_index) {
    await sleepNow(sleepTime)
    const searchQuery = `q=${keyword}+language:${language}`;
    const searchUrl = `https://api.github.com/search/repositories?${searchQuery}&per_page=100&sort=updated&order=desc&page=${page_index}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    return data.items;
}

const getCommitsCount = async (fullname, month) => {
    await sleepNow(sleepTime)
    console.log(fullname)
    const url = `https://api.github.com/repos/${fullname}/stats/commit_activity`;
    const response = await fetch(url);
    const data = await response.json();

    lastMonthCommits = 0
    if (data.length > 0)
        lastMonthCommits = data.slice(data.length > 5 * month ? -5 * month : data.length).reduce((tot, val) => tot + val.total, 0);

    return lastMonthCommits;
};

const getCommitsAuthors = async (fullname, commitCount) => {
    var authors = [], authInfo = [];
    for (var i = 1; i <= ((commitCount + 99) / 100); i++) {
        await sleepNow(sleepTime)
        const url = `https://api.github.com/repos/${fullname}/commits?per_page=100&page=${i}`;
        const response = await fetch(url);
        const data = await response.json();
        for (const commit of data) {
            if (!authors.includes(commit.commit.author.email) && !commit.commit.author.email.includes("noreply.github.com")) {
                authors.push(commit.commit.author.email)
                repoInfo.push({
                    repo_name: fullname,
                    user_name: commit.commit.author.name,
                    email: commit.commit.author.email
                })
            }
        }
    }

    console.log(repoInfo)

    return repoInfo;
};

const download = function (data) {

    // Creating a Blob for having a csv file format 
    // and passing the data with type
    const blob = new Blob([data], { type: 'text/csv' });

    // Creating an object for downloading url
    const url = window.URL.createObjectURL(blob)

    // Creating an anchor(a) tag of HTML
    const a = document.createElement('a')

    // Passing the blob downloading url 
    a.setAttribute('href', url)

    // Setting the anchor tag attribute for downloading
    // and passing the download file name
    a.setAttribute('download', 'download.csv');

    // Performing a download with click
    a.click()
}

const csvmaker = function (data, columnDelimiter, lineDelimiter) {
    let result, ctr, keys

	if (data === null || !data.length) {
		return null
	}

	keys = Object.keys(data[0])

	result = ""
	result += keys.join(columnDelimiter)
	result += lineDelimiter

	data.forEach(item => {
		ctr = 0
		keys.forEach(key => {
			if (ctr > 0) {
				result += columnDelimiter
			}

			result += typeof item[key] === "string" && item[key].includes(columnDelimiter) ? `"${item[key]}"` : item[key]
			ctr++
		})
		result += lineDelimiter
	})

	return result
}

// Call the function with the desired keyword and language
async function SearchRepo() {

    var keyword = document.getElementById("searchKey").value;
    var language = document.getElementById("codeLang").value;
    var month = document.getElementById("monNum").value;
    for (var j = 1; j <= 10; j++) {
        const repositories = await getRepositories(keyword, language, j);

        for (const repo of repositories) {
            repo.full_name = "umee-network/umee"
            const commitsLastMonth = await getCommitsCount(repo.full_name, month);

            if (commitsLastMonth > 0) {
                const authors = await getCommitsAuthors(repo.full_name, commitsLastMonth);
                console.log(`${repo.full_name}: ${commitsLastMonth} commits in the last month`);
            }
        }
    }

    var userResponse = confirm("Search is finished. You want to save the result?");

    if (userResponse) {
        const csvdata = csvmaker(repoInfo, ",", "\n");
        download(csvdata);
    } else {
    // The user clicked Cancel, so don't delete the file.
    }
}