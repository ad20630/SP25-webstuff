import React from "react";
import Header from "./PageHeader";
import { Editor } from "./editor/Editor";
import Sidebar from "components/Sidebar/Sidebar";
import { EditorProvider } from "state/editor/EditorContext";
import { DragAndDropProvider } from "state/dragAndDrop/DragAndDropContext";
import { MouseProvider } from "state/mouse/MouseContext";
import { TextEditingProvider } from "state/textEditing/TextEditingContext";
import { PagesProvider } from "state/pages/PagesContext";

type Props = {};

const AppPage = (props: Props) => {
  return (
    <MouseProvider>
      <DragAndDropProvider>
        <TextEditingProvider>
          <EditorProvider>
            <PagesProvider>
              <Header />
              <div className="page-content">
                <Editor />
                <Sidebar />
              </div>
            </PagesProvider>
          </EditorProvider>
        </TextEditingProvider>
      </DragAndDropProvider>
    </MouseProvider>
  );
};

export default AppPage;
