import { Editor } from '@tinymce/tinymce-react';

//This is the editor for TinyMCE - the richtext editor. Most settings will be here.

// TinyMCE so the global var exists
import 'tinymce/tinymce';
// DOM model
import 'tinymce/models/dom/model'
// Theme
import 'tinymce/themes/silver';
// Toolbar icons
import 'tinymce/icons/default';
// Editor styles
import 'tinymce/skins/ui/oxide/skin';

// importing the plugin js.
// if you use a plugin that is not listed here the editor will fail to load
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/autosave';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/directionality';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/help';
import 'tinymce/plugins/help/js/i18n/keynav/en';
import 'tinymce/plugins/image';
import 'tinymce/plugins/importcss';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/media';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/pagebreak';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/quickbars';
import 'tinymce/plugins/save';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/table';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/visualchars';
import 'tinymce/plugins/wordcount';

// importing plugin resources
import 'tinymce/plugins/emoticons/js/emojis';

// Content styles, including inline UI like fake cursors
import 'tinymce/skins/content/default/content';
import 'tinymce/skins/ui/oxide/content';
import React from 'react';


export default function BundledEditor(props) {
  const { initialValue, onEditorChange } = props;

  return (
    <Editor
        licenseKey='gpl'//Using GPL license - NOT commercial
        init={{
            height: 500,
            menubar: false,
            promotion: false,
            initialValue: initialValue,
            toolbar1: 'undo redo link | blocks | removeformat ',
            toolbar2: 'bold italic forecolor alignment| bullist numlist outdent indent',
            toolbar3: '',
            toolbar_groups: {
                alignment: {
                  icon: 'align-center',
                  tooltip: 'Alignment',
                  items: 'alignleft aligncenter alignright alignjustify'
                }
            },
            plugins: [
            'advlist', 'autolink', 'lists', 'link',
            'searchreplace', 'visualblocks', 'wordcount'
            ],

            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
          }
        }
        onEditorChange={onEditorChange} //syncs editor change rules 
        onInit={(evt, editor) => {
            if (initialValue) {
              editor.setContent(initialValue);  // Explicitly set the content if it is passed
            }
            else if (!initialValue){
                editor.setContent("weird");
            }
            else{
                editor.setContent("oops, no content!");
            }
        }
    }
    />
  );
}