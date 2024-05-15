import { load } from "cheerio";
import pretty from "pretty";

export const DefaultRemovedMarkupCssSelectors = [
  'link[rel="mask-icon"]',
  'link[rel="shortcut icon"]',
  'link[rel="icon"]',
  'link[rel^="apple-touch-icon"]',
  'link[rel="manifest"]',
];

export const injectMarkupInHtmlHead = (
  htmlCode: string,
  markupsToAdd: string[],
  cssSelectorsOfMarkupsToRemove: string[]
): string => {
  // Inject the markups with cheerio

  const $ = load(htmlCode);

  // Remove the specified markups
  cssSelectorsOfMarkupsToRemove.forEach((selector) => {
    $(selector).remove();
  });

  // Add the new markups
  markupsToAdd.forEach((markup) => {
    $('head').append(markup);
  });

  return pretty($.html());
}
