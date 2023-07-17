# Slidy NPM Package Installation Guide

Slidy is a powerful npm package that allows you to create beautiful and interactive sliders for your web projects. This guide will walk you through the process of installing and configuring Slidy for your website.

## Installation

### 1. Importing Slidy

First, you need to import the `index.js` file into your JavaScript file. This is the main file that will initialize Slidy for your project.

```js
import slidy from './node_modules/@dschen/slidy/index.js';

slidy.init();

export default {};
```

### 2. Adding Scripts and Styles

Next, you'll need to include your JavaScript file at the bottom of your HTML file and link the required CSS styles in the `<head>` section.

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Add other meta tags, title, etc. here -->

    <link rel="stylesheet" href="./node_modules/@dschen/slidy/lib/styles/styles.css">

    <!-- Add other CSS files and styles here -->
  </head>
  <body>
    <!-- Your page content -->

    <script type="module" src="index.js"></script>
  </body>
</html>
```

Make sure to replace `index.js` with the path to your JavaScript file containing the Slidy import and initialization.

## Configuration

To use Slidy on your web page, you need to add specific classes to your HTML elements. These classes enable Slidy to identify and transform the content into a slider.

```html
<div class="slidy">
  <div class="slidy-stage">
    <article class="slidy-item article card">
      <!-- Add your slider content here (e.g., images, text, etc.) -->
    </article>
    <!-- Add more .slidy-item elements for additional slides -->
  </div>
  <div>
    <button class="slidy-previous">
      <!-- Add the text for the "previous slide" button here -->
    </button>
    <div class="slidy-indicators">
      <!-- Add this element if you want to display slider indicators -->
    </div>
    <button class="slidy-next">
      <!-- Add the text for the "next slide" button here -->
    </button>
  </div>
</div>
```

Replace the example content inside the `.slidy-item` element with your own images, text, or any other content you wish to showcase within the slider.

And that's it! With these simple steps, you can now install and configure the Slidy npm package to create stunning sliders for your web projects. Enjoy using Slidy and make your website more interactive and engaging with this fantastic slider tool.

## CSS Classes Reference

Below is a list of CSS classes used by Slidy along with their descriptions:

| CSS class         | Needed   | Description                                                                                   |
| ----------------- | -------- | --------------------------------------------------------------------------------------------- |
| .slidy            | yes      | HTML wrapper that enclosures every element responsible for the slider (eg. navigation buttons) |
| .slidy-stage      | yes      | HTML where the slides live                                                                    |
| .slidy-item       | yes      | HTML wrapper that enclosures the slide HTML.                                                                                               |
| .slidy-indicators | optional | HTML wrapper where the slider indicators will appear if needed                                |
| .slidy-next       | optional | HTML `<button>` to skip to the next slide                                                     |
| .slidy-previous   | optional | HTML `<button>` to skip to the previous slide                                                 |
