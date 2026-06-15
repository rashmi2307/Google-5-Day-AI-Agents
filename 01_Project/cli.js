#!/usr/bin/env node

import Parser from 'rss-parser';
import pc from 'picocolors';
import minimist from 'minimist';
import readline from 'readline/promises';
import { exec } from 'child_process';

// Google News Topic mapping
const TOPICS = {
  world: 'WORLD',
  nation: 'NATION',
  business: 'BUSINESS',
  technology: 'TECHNOLOGY',
  entertainment: 'ENTERTAINMENT',
  sports: 'SPORTS',
  science: 'SCIENCE',
  health: 'HEALTH'
};

const helpMessage = `
${pc.bold(pc.cyan('Google News CLI'))}
${pc.dim('Fetch the latest news from Google News directly in your terminal.')}

${pc.bold('Usage:')}
  ${pc.green('node cli.js')} [options]

${pc.bold('Options:')}
  ${pc.green('-s, --search <query>')}   Search news for a specific query
  ${pc.green('-t, --topic <topic>')}     Filter news by topic (see list below)
  ${pc.green('-l, --limit <number>')}     Limit the number of news stories (default: 10, max: 100)
  ${pc.green('-u, --url')}                Display full URL for each news story
  ${pc.green('-h, --help')}               Show this help message

${pc.bold('Topics:')}
  ${Object.keys(TOPICS).map(t => pc.magenta(t)).join(', ')}

${pc.bold('Examples:')}
  ${pc.dim('# Fetch top stories:')}
  node cli.js
  
  ${pc.dim('# Fetch technology news (limit 5):')}
  node cli.js -t technology -l 5
  
  ${pc.dim('# Search for "artificial intelligence":')}
  node cli.js -s "artificial intelligence"
`;

// Helper to format date to relative time
function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;

  if (isNaN(diffMs)) return '';

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

// Helper to open a URL in default browser
function openUrl(url) {
  let command;
  if (process.platform === 'win32') {
    // Escape single quotes for PowerShell
    const escapedUrl = url.replace(/'/g, "''");
    command = `powershell -Command "Start-Process '${escapedUrl}'"`;
  } else if (process.platform === 'darwin') {
    command = `open "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  exec(command, (err) => {
    if (err) {
      console.error(pc.red(`\nFailed to open URL in browser: ${err.message}`));
    }
  });
}

async function main() {
  const argv = minimist(process.argv.slice(2), {
    alias: {
      s: 'search',
      t: 'topic',
      l: 'limit',
      u: 'url',
      h: 'help'
    },
    boolean: ['url', 'help'],
    string: ['search', 'topic']
  });

  if (argv.help) {
    console.log(helpMessage);
    process.exit(0);
  }

  // Determine standard search query or topic url
  let url = 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en';
  let titleHeader = pc.bold(pc.cyan('Top Stories - Google News'));

  if (argv.search) {
    const query = argv.search.trim();
    url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    titleHeader = pc.bold(pc.cyan(`Search results for "${query}" - Google News`));
  } else if (argv.topic) {
    const topicKey = argv.topic.toLowerCase().trim();
    const topicValue = TOPICS[topicKey];
    if (!topicValue) {
      console.error(pc.red(`\nError: Invalid topic "${topicKey}".`));
      console.error(`Available topics: ${Object.keys(TOPICS).map(t => pc.magenta(t)).join(', ')}`);
      process.exit(1);
    }
    url = `https://news.google.com/rss/headlines/section/topic/${topicValue}?hl=en-US&gl=US&ceid=US:en`;
    titleHeader = pc.bold(pc.cyan(`${topicKey.charAt(0).toUpperCase() + topicKey.slice(1)} News - Google News`));
  }

  const parser = new Parser({
    customFields: {
      item: [
        ['source', 'source']
      ]
    }
  });

  console.log(pc.yellow('\nFetching news...'));

  try {
    const feed = await parser.parseURL(url);
    const limit = parseInt(argv.limit, 10) || 10;
    const itemsToShow = feed.items.slice(0, Math.min(limit, 100));

    if (itemsToShow.length === 0) {
      console.log(pc.red('No news articles found.'));
      process.exit(0);
    }

    console.clear();
    console.log(`\n======================================================`);
    console.log(`  ${titleHeader}`);
    console.log(`======================================================\n`);

    itemsToShow.forEach((item, index) => {
      const idxStr = pc.green(`[${index + 1}]`);
      const sourceStr = item.source ? pc.blue(` (${item.source})`) : '';
      const timeStr = item.pubDate ? pc.dim(` • ${formatRelativeTime(item.pubDate)}`) : '';

      console.log(`${idxStr} ${pc.bold(item.title)}${sourceStr}${timeStr}`);
      if (argv.url) {
        console.log(`    ${pc.underline(pc.cyan(item.link))}`);
      }
      console.log();
    });

    console.log(`======================================================`);

    // Interactive part to open in browser
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    try {
      const answer = await rl.question(
        pc.yellow('\nEnter the article number to open in your browser (or press Enter to exit): ')
      );

      const selection = parseInt(answer.trim(), 10);
      if (!isNaN(selection) && selection >= 1 && selection <= itemsToShow.length) {
        const selectedItem = itemsToShow[selection - 1];
        console.log(pc.green(`\nOpening: "${selectedItem.title}"...`));
        openUrl(selectedItem.link);
      }
    } finally {
      rl.close();
    }

  } catch (err) {
    console.error(pc.red(`\nFailed to fetch or parse news: ${err.message}`));
    process.exit(1);
  }
}

main();
