// Editor.tsx
import React, { useState, useRef } from "react";
import { Header } from "./Header";
import { Body } from "./Body";
import { Footer } from "./Footer";
import { useEditor } from "state/editor/EditorReducer";
import { useMouse } from "state/mouse/MouseReducer";
import { useDragAndDropContext } from "state/dragAndDrop/DragAndDropReducer";
import { HtmlObject } from "types/HtmlObject";
import { getDropChildId, insertDroppedElement, parseId } from "state/editor/Helpers";

export const Editor = () => {
  const { state: editor, dispatch: editorDispatch } = useEditor();
  const {state: mouseState} = useMouse();
  const {dragState} = useDragAndDropContext();

  let data = {
    header: editor.header,
    body: editor.body,
    footer: editor.footer
  };

  if (dragState.isDragging && editor.hoveredItemId && dragState.canDrop) {
    const {section, index} = parseId(editor.hoveredItemId);
    const predictedIndex = getDropChildId(mouseState, editor, editor.hoveredItemId);
    data[section] = structuredClone(editor[section]);
    
    // Only insert the actual dropped element when it's being dropped, not during drag
    if (dragState.dragPayload) {
      let htmlObject: HtmlObject;
      
      // Check if this is an image payload
      if (dragState.dragPayload.type === "image") {
        const imagePayload = dragState.dragPayload;
        htmlObject = {
          metadata: {
            name: "Image",
            tooltip: "A place to upload and display an Image",
            type: "WIDGET",
            icon: "image-icon"
          },
          html: {
            nodes: [
              {
                element: "div",
                attributes: {
                  className: { value: "elementContainer" }
                },
                style: {
                  width: {
                    value: imagePayload.initialDimensions?.width || "300px",
                    input: {
                      type: "text",
                      displayName: "Width"
                    }
                  },
                  height: {
                    value: imagePayload.initialDimensions?.height || "200px",
                    input: {
                      type: "text",
                      displayName: "Height"
                    }
                  }
                },
                children: [1],
                metadata: {
                  draggable: true,
                  selectable: true,
                  resizable: true,
                  type: "WIDGET"
                }
              },
              {
                element: "img",
                attributes: {
                  className: {
                    value: imagePayload.className || "image aspect-ratio-preserved",
                    readonly: true,
                    input: {
                      type: "text",
                      displayName: "Class Name",
                      tooltip: "This cannot be changed."
                    }
                  },
                  src: {
                    value: imagePayload.url,
                    input: {
                      type: "text",
                      displayName: "File"
                    }
                  },
                  alt: {
                    value: imagePayload.alt || "Image",
                    input: {
                      type: "text",
                      displayName: "Alt Text"
                    }
                  }
                },
                style: {
                  width: {
                    value: "100%",
                    input: {
                      type: "text",
                      displayName: "Width"
                    }
                  },
                  height: {
                    value: "100%",
                    input: {
                      type: "text",
                      displayName: "Height"
                    }
                  },
                  objectFit: {
                    value: imagePayload.style?.objectFit || "contain",
                    input: {
                      type: "select",
                      displayName: "Object Fit",
                      options: [
                        { value: "contain", text: "Contain" },
                        { value: "cover", text: "Cover" },
                        { value: "fill", text: "Fill" },
                        { value: "none", text: "None" },
                        { value: "scale-down", text: "Scale Down" }
                      ]
                    }
                  }
                },
                metadata: {
                  primary: true
                }
              }
            ]
          }
        };
      } else {
        // For non-image widgets, use the payload as is
        htmlObject = dragState.dragPayload;
      }
      
      data[section] = insertDroppedElement(predictedIndex, editor, htmlObject, editor.hoveredItemId)[section];
    }
  }

  return (
    <div id="editor-window" className="editor">
      <div className="editor-container">
        <div className="header-section">
          <div className="tab" style={{textAlign: "center"}}>Header</div>
          <Header content={data.header} />
        </div>
        <div className="body-section">
          <div className="tab" style={{textAlign: "center"}}>Body</div>
          <Body content={data.body} />
        </div>
        <div className="footer-section">
          <div className="tab" style={{textAlign: "center"}}>Footer</div>
          <Footer content={data.footer} />
        </div>
      </div>
    </div>
  );
};

export default Editor;
