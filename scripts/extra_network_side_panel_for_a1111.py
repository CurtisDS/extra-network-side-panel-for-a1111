from modules import script_callbacks, ui_extra_networks, shared
import gradio as gr


def on_ui_settings():
    section = ('extra_networks', 'Extra Networks')
    page_titles = [page.title for page in ui_extra_networks.extra_pages]
    shared.opts.add_option(
        'extra_networks_side_panel_default_tab',
        shared.OptionInfo(
            page_titles[0],
            'Extra networks side panel default tab',
            gr.Radio,
            {
                'choices': page_titles,
            },
            section=section
        ).info('The default tab that is selected when opening the extra networks side panel')
    )


script_callbacks.on_ui_settings(on_ui_settings)
