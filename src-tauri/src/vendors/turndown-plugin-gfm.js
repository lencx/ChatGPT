var turndownPluginGfm = (function (exports) {
  'use strict';

  var highlightRegExp = /highlight-(?:text|source)-([a-z0-9]+)/;

  function highlightedCodeBlock (turndownService) {
    turndownService.addRule('highlightedCodeBlock', {
      filter: function (node) {
        var firstChild = node.firstChild;
        return (
          node.nodeName === 'DIV' &&
          highlightRegExp.test(node.className) &&
          firstChild &&
          firstChild.nodeName === 'PRE'
        )
      },
      replacement: function (content, node, options) {
        var className = node.className || '';
        var language = (className.match(highlightRegExp) || [null, ''])[1];

        return (
          '\n\n' + options.fence + language + '\n' +
          node.firstChild.textContent +
          '\n' + options.fence + '\n\n'
        )
      }
    });
  }

  function strikethrough (turndownService) {
    turndownService.addRule('strikethrough', {
      filter: ['del', 's', 'strike'],
      replacement: function (content) {
        return '~' + content + '~'
      }
    });
  }

  var indexOf = Array.prototype.indexOf;
  var every = Array.prototype.every;
  var rules = {};

  rules.tableCell = {
    filter: ['th', 'td'],
    replacement: function (content, node) {
      return cell(content, node)
    }
  };

  rules.tableRow = {
    filter: 'tr',
    replacement: function (content, node) {
      var borderCells = '';
      var alignMap = { left: ':--', right: '--:', center: ':-:' };

      if (isHeadingRow(node)) {
        for (var i = 0; i < node.childNodes.length; i++) {
          var border = '---';
          var align = (
            node.childNodes[i].getAttribute('align') || ''
          ).toLowerCase();

          if (align) border = alignMap[align] || border;

          borderCells += cell(border, node.childNodes[i]);
        }
      }
      return '\n' + content + (borderCells ? '\n' + borderCells : '')
    }
  };

  rules.table = {
    // Only convert tables with a heading row.
    // Tables with no heading row are kept using `keep` (see below).
    filter: function (node) {
      return node.nodeName === 'TABLE' && isHeadingRow(node.rows[0])
    },

    replacement: function (content) {
      // Ensure there are no blank lines
      content = content.replace('\n\n', '\n');
      return '\n\n' + content + '\n\n'
    }
  };

  rules.tableSection = {
    filter: ['thead', 'tbody', 'tfoot'],
    replacement: function (content) {
      return content
    }
  };

  // A tr is a heading row if:
  // - the parent is a THEAD
  // - or if its the first child of the TABLE or the first TBODY (possibly
  //   following a blank THEAD)
  // - and every cell is a TH
  function isHeadingRow (tr) {
    var parentNode = tr.parentNode;
    return (
      parentNode.nodeName === 'THEAD' ||
      (
        parentNode.firstChild === tr &&
        (parentNode.nodeName === 'TABLE' || isFirstTbody(parentNode)) &&
        every.call(tr.childNodes, function (n) { return n.nodeName === 'TH' })
      )
    )
  }

  function isFirstTbody (element) {
    var previousSibling = element.previousSibling;
    return (
      element.nodeName === 'TBODY' && (
        !previousSibling ||
        (
          previousSibling.nodeName === 'THEAD' &&
          /^\s*$/i.test(previousSibling.textContent)
        )
      )
    )
  }

  function cell (content, node) {
    var index = indexOf.call(node.parentNode.childNodes, node);
    var prefix = ' ';
    if (index === 0) prefix = '| ';
    return prefix + content + ' |'
  }

  function tables (turndownService) {
    turndownService.keep(function (node) {
      return node.nodeName === 'TABLE' && !isHeadingRow(node.rows[0])
    });
    for (var key in rules) turndownService.addRule(key, rules[key]);
  }

  function taskListItems (turndownService) {
    turndownService.addRule('taskListItems', {
      filter: function (node) {
        return node.type === 'checkbox' && node.parentNode.nodeName === 'LI'
      },
      replacement: function (content, node) {
        return (node.checked ? '[x]' : '[ ]') + ' '
      }
    });
  }

  function gfm (turndownService) {
    turndownService.use([
      highlightedCodeBlock,
      strikethrough,
      tables,
      taskListItems
    ]);
  }

  exports.gfm = gfm;
  exports.highlightedCodeBlock = highlightedCodeBlock;
  exports.strikethrough = strikethrough;
  exports.tables = tables;
  exports.taskListItems = taskListItems;

  return exports;
}({}));