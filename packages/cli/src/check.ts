import { CheckerMessage, CheckerStatus, FaviconReport, checkFavicon, reportHasErrors, reportHasWarnings } from "@realfavicongenerator/check-favicon";
import { parse } from 'node-html-parser'
import { getUrl } from '@/helper'
import open from 'open'
import { RealFaviconGeneratorBaseUrl } from "./common.js";

const statusToIcon = (status: CheckerStatus): string => {
  switch(status) {
    case CheckerStatus.Error:
      return '❌';
    case CheckerStatus.Warning:
      return '⚠️';
    case CheckerStatus.Ok:
      return '✅';
  }

  return '❓';
}

const printMessages = (report: CheckerMessage[], indentation = 2) => {
  const indent = ' '.repeat(indentation);

  report.forEach((message) => {
    console.log(`${indent}${statusToIcon(message.status)} ${message.text}`);
  });
}

enum Screen { Cli, RealFavicon }

export const stringToScreen = (screen: string): Screen => {
  switch(screen) {
    case 'cli':
      return Screen.Cli;
    default:
    case 'realfavicon':
      return Screen.RealFavicon;
  }
}

const printCliReport = (report: FaviconReport) => {
  console.log();
  console.log("Desktop");
  printMessages(report.desktop.messages);

  console.log();
  console.log("Touch");
  printMessages(report.touchIcon.messages);

  console.log();
  console.log("Web Manifest");
  printMessages(report.webAppManifest.messages);
}

export const check = async (urlOrPort: string, screen: Screen, warningAsErrors = false): Promise<number> => {
  const url = getUrl(urlOrPort);
  console.log(`Check favicon at ${url}`);

  const response = await fetch(url);
  const html = await response.text();
  const root = parse(html);
  const head = root.querySelector('head');

  const report = await checkFavicon(url, head);
  console.log('Check completed');

  switch(screen) {
    case Screen.Cli:
      printCliReport(report);
      break;
    case Screen.RealFavicon:
      const result = await fetch(`${RealFaviconGeneratorBaseUrl}api/check/report`, { method: 'POST', body: JSON.stringify(report)});
      const json = await result.json();
      const reportUrl = `${RealFaviconGeneratorBaseUrl}checker/${json.id}`;
      console.log(`Open report at ${reportUrl}`);
      await open(reportUrl);
      break;
  }

  if (reportHasErrors(report)) {
    return 2;
  } else if (warningAsErrors && reportHasWarnings(report)) {
    return 1;
  }

  return 0;
}
