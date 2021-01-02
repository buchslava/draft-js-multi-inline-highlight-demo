import React, { useRef, useState, useEffect } from "react";
import { Editor, EditorState, ContentState, ContentBlock } from "draft-js";
// @ts-ignore
import DraftPasteProcessor from "draft-js/lib/DraftPasteProcessor";
import { text } from "./text";
import {
  MultiHighlightDecorator,
  WordMatcher,
  SentenceMatcher,
  MultiHighlightConfig,
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
  const editor = useRef<any>(null);
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
  const initHighlightConfig: MultiHighlightConfig = {
    rules: [
      {
        content: ["His back begins to ache, but he knows he can bear it."],
        style: "yellow",
        matcher: SentenceMatcher,
      },
      {
        content: ["and"],
        style: "red",
        matcher: WordMatcher,
      },
      {
        content: ["pulled", "knows"],
        style: "blue",
        matcher: WordMatcher,
      },
    ],
    styles: hightlightStyles,
  };

  const blockStyleFn = (block: ContentBlock) =>
    block.getKey() === secondParagraph ? "grey-paragraph" : "normal-paragraph";
  const [highlightConfig, setHighlightConfig] = useState<MultiHighlightConfig>(initHighlightConfig);
  const [secondParagraph, setSecondParagraph] = useState<string>();
  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(
      contentState,
      MultiHighlightDecorator(highlightConfig)
    )
  );

  function focusEditor() {
    editor.current.focus();
  }

  useEffect(() => {
    editorState
      .getCurrentContent()
      .getBlocksAsArray()
      .forEach((bl: ContentBlock, index: number) => {
        if (index === 2) {
          setSecondParagraph(bl.getKey());
        }
      });
  }, [editorState]);

  useEffect(() => {
    if (highlightConfig) {
      setEditorState(
        EditorState.set(editorState, {
          decorator: MultiHighlightDecorator(highlightConfig),
        })
      );
    }
  }, [highlightConfig]);

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
            newConfig.rules[1].content = ["the"];
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
            newConfig.rules[0].content = [
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
