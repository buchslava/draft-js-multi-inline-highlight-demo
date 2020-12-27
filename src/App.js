import React, { useRef, useState, useEffect } from "react";
import { Editor, EditorState, ContentState } from "draft-js";
import DraftPasteProcessor from "draft-js/lib/DraftPasteProcessor";
import { text } from "./text";
import {
  MultiHighlightDecorator,
  WordMathcher,
  SentenceMatcher,
  useMultiHighlightConfigChange,
} from "draft-js-multi-inline-highlight";

const styles = {
  editor: {
    border: "1px solid gray",
    minHeight: "6em",
    margin: 20,
  },
};

function App() {
  const processedHTML = DraftPasteProcessor.processHTML(text);
  const contentState = ContentState.createFromBlockArray(processedHTML);
  const editor = useRef(null);
  const hightlightStyles = {
    yellow: {
      backgroundColor: "yellow",
    },
    red: {
      color: "red",
    },
    blue: {
      color: "blue",
    },
  };
  const initHighlightConfig = {
    rules: [
      {
        words: ["His back begins to ache, but he knows he can bear it."],
        style: "yellow",
        matcher: SentenceMatcher,
      },
      {
        words: ["and"],
        style: "red",
        matcher: WordMathcher,
      },
      {
        words: ["pulled", "knows"],
        style: "blue",
        matcher: WordMathcher,
      },
    ],
    styles: hightlightStyles,
  };

  const blockStyleFn = (block) =>
    block.getKey() === secondParagraph ? "grey-paragraph" : "normal-paragraph";
  const [highlightConfig, setHighlightConfig] = useState(initHighlightConfig);
  const [secondParagraph, setSecondParagraph] = useState();
  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(
      contentState,
      MultiHighlightDecorator(highlightConfig)
    )
  );

  useMultiHighlightConfigChange(highlightConfig, editorState, setEditorState);

  function focusEditor() {
    editor.current.focus();
  }

  useEffect(() => {
    editorState
      .getCurrentContent()
      .getBlocksAsArray()
      .forEach((bl, index) => {
        if (index === 2) {
          setSecondParagraph(bl.getKey());
        }
      });
  }, [editorState]);

  useEffect(() => {
    focusEditor();
  }, []);

  return (
    <div onClick={focusEditor} style={styles.editor}>
      <div>
        <button
          disabled={!(highlightConfig.rules.length > 1)}
          onClick={(e) => {
            e.preventDefault();
            const newConfig = { ...highlightConfig };
            newConfig.rules[1].words = ["the"];
            setHighlightConfig(newConfig);
          }}
        >
          Change "and" to "the"
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setHighlightConfig(initHighlightConfig);
          }}
        >
          Initial state
        </button>
        <button
          disabled={!(highlightConfig.rules.length > 1)}
          onClick={(e) => {
            e.preventDefault();
            const newConfig = { ...highlightConfig };
            newConfig.rules[0].words = [
              "At noon that day, a fish takes the bait on one of his lines.",
              "The old man is very cautious, using all his knowledge, gained through decades of experience on the water, to know what to do with the line and when.",
              "His back begins to ache, but he knows he can bear it.",
            ];
            setHighlightConfig(newConfig);
          }}
        >
          Also, select 2 first sentences
        </button>
        <button
          disabled={!(highlightConfig.rules.length > 1)}
          onClick={(e) => {
            e.preventDefault();
            setHighlightConfig({
              rules: [],
              styles: hightlightStyles,
            });
          }}
        >
          Reset hightlighting
        </button>
      </div>
      <Editor
        ref={editor}
        blockStyleFn={blockStyleFn}
        editorState={editorState}
        onChange={(newState) => {
          setEditorState(newState);
        }}
      />
    </div>
  );
}

export default App;
