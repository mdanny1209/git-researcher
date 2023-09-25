# Github search tool
Github search tool is for searching repositories.
I really noticed that there're lots of repositories. Maybe you wanna find some projects that want to join or contribute, isn't it?
If then, how can you find the projects? And after that, what can you do? How can you contact the dev team?
I'll describe how to find the projects and how to get the email of the contributors.
After that, we'll download the result to csv file.

## Requirements
Nothing needed. Just need a browser, editor(like vscode or notepad. anything that can edit text will be fine) and the knowledge for github api.

## How to search and get contact info
### 1. How to search in javascript using Github API

Let's have a look about Github api before start.
Github APIs( or Github ReST APIs) are the APIs that you can use to interact with GitHub. They allow you to create and manage repositories, branches, issues, pull requests, and many more. For fetching publicly available information (like public repositories, user profiles, etc.), you can call the API.

We'll use the power of Github API - search repositories, and get commit info.

If you want to find repositories sorted by updated date, then the code below will implement that.
``` javascript
const searchQuery = `q=${keyword}+language:${language}`;
const searchUrl = `https://api.github.com/search/repositories?${searchQuery}&per_page=100&sort=updated&order=desc&page=${page_index}`;

const response = await fetch(searchUrl);
const data = await response.json();
```
- Here `q=${keyword}` means query the repositories with `keyword`.
- `language` is a simple one. You can set that as a `Go`, `C`, `Javascript`...

As you know, github api call send the result with pagination.
- `per_page=100` means the max item count in one page, the max value is 100.
- `page=${page_index}` means get the result of page `page_index`.
- `sort=updated&order=desc` means get the result sorted by updated date.


With this, you can get the repostories with `keyword` and `language` sorted by updated date.
### 2. How to get last month commits count
Now it's time to get the last month's commit count for the new projects or alive projects.

``` javascript
const url = `https://api.github.com/repos/${fullname}/stats/commit_activity`;
const response = await fetch(url);
const data = await response.json();

lastMonthCommits = 0
if (data.length > 0)
    lastMonthCommits = data.slice(data.length > 5  ? -5  : data.length).reduce((tot, val) => tot + val.total, 0);
```

- `fullname` is a repository name like `cosmos/cosmos-sdk`
This github api returns the weekly commits count sorted by time(asc).

So if you want the last commit count, you can sum the last 5 weeks' commits count. (if the length is below 5, then return total value.)


### 3. How to get contributors' email info
Now, we got the repositories and last month commits count.
So what's remaining? Yep, that is the contributor's email.
Let's continue. How can we get the contributor's email?
That can be done with the commits data.
Commits data has the commiter info including user name, user email, etc.

``` javascript
for (var i = 1; i <= ((commitCount + 99) / 100); i++) {
    const url = `https://api.github.com/repos/${fullname}/commits?per_page=100&page=${i}`;
    const response = await fetch(url);
    const data = await response.json();
    for (const commit of data) {
        if (!authors.includes(commit.commit.author.email) && !commit.commit.author.email.includes("noreply.github.com")) {
            repoInfo.push({
                repo_name: fullname,
                user_name: commit.commit.author.name,
                email: commit.commit.author.email
            })
        }
    }
}
```

### 4. Download the search result
So we got the repositories, commits count, and contributors' email. What's next?
Yeah, convert the data to csv and let's download the csv file.

``` javascript
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
```

That's the end. Some problems are remaining like github api limit. I'm trying to solve that now. I'll update if there's a result.

If you want any questions, please feel free to contact me.

- email: mdanny1209@gmail.com
- discord: mdanny1209