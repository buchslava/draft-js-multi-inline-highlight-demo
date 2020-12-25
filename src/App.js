import React, { useRef, useState, useEffect } from "react";
import { Editor, EditorState, ContentState } from "draft-js";
import DraftPasteProcessor from "draft-js/lib/DraftPasteProcessor";
import SimpleDecorator from "draft-js-simpledecorator";
import { text } from "./text";

const styles = {
  editor: {
    border: "1px solid gray",
    minHeight: "6em",
    margin: 20,
  },
};

// function findWithRegex(words, contentBlock, callback) {
//   const text = contentBlock.getText();

//   words.forEach((word) => {
//     const matches = [...text.matchAll(word)];
//     matches.forEach((match) =>
//       callback(match.index, match.index + match[0].length)
//     );
//   });
// }

class Fragments {
  constructor() {
    this.data = {
      yellow: [],
      red: [],
    };
  }
  getDecoratedRanges() {
    const result = [];
    const ranges = this.getAbsoluteRanges();
    for (const range of ranges) {
      result.push(this.getStylesForRange(range));
    }
    return result;
  }
  isMultiply() {
    return (
      Object.keys(this.data).reduce((acc, key) => {
        acc += this.data[key].length > 0 ? 1 : 0;
        return acc;
      }, 0) > 1
    );
  }
  getSimpleRanges() {
    for (const key of Object.keys(this.data)) {
      if (this.data[key].length > 0) {
        return {
          range: this.data[key],
          style: key,
        };
      }
    }
  }
  add(nick, range) {
    this.data[nick].push(range);
  }
  getAbsoluteRanges() {
    let merged = [];
    for (const key of Object.keys(this.data)) {
      merged = merged.concat(...this.data[key]);
    }
    const ranges = [...new Set([...merged])].sort();
    const result = [];
    for (let i = 0; i < ranges.length - 1; i++) {
      result.push([ranges[i], ranges[i + 1]]);
    }
    return result;
  }
  getStylesForRange(range) {
    const start = range[0];
    const end = range[1];
    const styles = [];
    for (const key of Object.keys(this.data)) {
      if (this.data[key]) {
        for (const r of this.data[key]) {
          if (start >= r[0] && end <= r[1]) {
            styles.push(key);
            break;
          }
        }
      }
    }
    return {
      range: [start, end],
      styles,
    };
  }
}

const stylesTemp = {
  yellow: {
    backgroundColor: "yellow",
  },
  red: {
    color: "red",
  },
};

const decorator = new SimpleDecorator(
  function strategy(contentBlock, callback, contentState) {
    const text = contentBlock.getText();
    let match;

    const fragments = new Fragments();

    let rule3 = /correct/g;
    while ((match = rule3.exec(text)) !== null) {
      let start = match.index;
      let end = start + match[0].length;
      fragments.add("red", [start, end]);
    }

    let rule2 = /more a matter/g;
    while ((match = rule2.exec(text)) !== null) {
      let start = match.index;
      let end = start + match[0].length;
      fragments.add("yellow", [start, end]);
    }
    let rule1 = /more/g;
    while ((match = rule1.exec(text)) !== null) {
      let start = match.index;
      let end = start + match[0].length;
      fragments.add("red", [start, end]);
    }
    if (fragments.isMultiply()) {
      const ranges = fragments.getDecoratedRanges();
      for (const range of ranges) {
        let style = {};
        for (const s of range.styles) {
          style = { ...style, ...stylesTemp[s] };
        }
        callback(range.range[0], range.range[1], style);
      }
    } else {
      const singleRanges = fragments.getSimpleRanges();
      if (singleRanges) {
        for (const range of singleRanges.range) {
          callback(range[0], range[1], stylesTemp[singleRanges.style]);
        }
      }
    }
  },

  function component(props) {
    return (
      <span
        style={{ color: props.color, backgroundColor: props.backgroundColor }}
      >
        {props.children}
      </span>
    );
  }
);

function App() {
  const processedHTML = DraftPasteProcessor.processHTML(text);
  const contentState = ContentState.createFromBlockArray(processedHTML);
  const editor = useRef(null);
  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(contentState, decorator)
  );

  function focusEditor() {
    editor.current.focus();
  }

  useEffect(() => {
    focusEditor();
  }, []);

  return (
    <div onClick={focusEditor} style={styles.editor}>
      <Editor
        ref={editor}
        editorState={editorState}
        onChange={(newState) => {
          setEditorState(newState);
        }}
      />
    </div>
  );
}

export default App;
