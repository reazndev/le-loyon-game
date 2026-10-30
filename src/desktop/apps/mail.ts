import { dialogues } from '../../content';
import type { Computer } from '../computer';
import { h } from '../dom';
import { icon } from '../gfx/icons';
import { ScrollPane } from '../ui/scrollPane';
import type { AppWindow } from '../ui/window';
import { mails, type Mail } from './mailData';

/** Courrier: folders on the left, the inbox list on top, the open message below. It opens on the newest message. */
export class MailApp {
  private win: AppWindow | null = null;
  private readonly unread = new Set(mails);
  private selected: Mail | null = null;
  private thoughtShown = false;
  private readonly list = h('div', { style: 'height:84px;background:#fff;overflow:hidden' });
  private rows = new Map<Mail, HTMLElement>();
  private readonly reader = new ScrollPane();
  private readonly status = h('div', { class: 'sunken', style: 'padding:2px 6px;margin-top:2px' });

  constructor(private readonly pc: Computer) {
    this.reader.onScroll = () => this.checkSpamEnd();
  }

  open(): void {
    this.win ??= this.build();
    this.pc.windows.open(this.win);
    if (!this.selected) this.show(mails[0]!);
  }

  private build(): AppWindow {
    const win = this.pc.windows.create({
      title: 'Courrier - Inbox',
      icon: 'mail',
      at: 'max',
      menu: ['File', 'Edit', 'View', 'Message', 'Help'],
      onClose: () => (this.win = null),
      focus: () => ({ items: [...this.rows.values()], pane: this.reader, initial: this.selected ? (this.rows.get(this.selected) ?? null) : null }),
    });
    const tool = (label: string, run?: () => void) => h('div', { class: `btn${run ? '' : ' off'}`, onClick: run }, label);
    const folder = (label: string, active = false) =>
      h('div', { style: `display:flex;gap:4px;padding:1px 4px;${active ? 'background:#22356f;color:#fff' : ''}` }, icon('mail'), label);
    win.body.append(
      h(
        'div',
        { style: 'display:flex;gap:2px;padding:2px 0 4px' },
        tool('Get Msg', () => (this.status.textContent = 'No new messages on server.')),
        tool('New Msg'),
        tool('Reply'),
        tool('Forward'),
        tool('Delete'),
      ),
      h(
        'div',
        { style: 'flex:1;min-height:0;display:flex;gap:4px' },
        h('div', { class: 'sunken', style: 'width:112px;background:#fff;padding:4px 2px' }, folder(`Inbox (${mails.length})`, true), folder('Drafts'), folder('Sent'), folder('Trash')),
        h(
          'div',
          { style: 'flex:1;min-width:0;display:flex;flex-direction:column;gap:4px' },
          h('div', { class: 'sunken', style: 'padding:2px' }, this.header(), this.list),
          h('div', { class: 'sunken', style: 'flex:1;min-height:0;display:flex;padding:2px' }, this.reader.element),
        ),
      ),
      this.status,
    );
    this.renderList();
    return win;
  }

  private header(): HTMLElement {
    const cell = (text: string, style: string) => h('div', { class: 'raised', style: `padding:1px 4px;${style}` }, text);
    return h('div', { style: 'display:flex' }, cell('From', 'width:136px'), cell('Subject', 'flex:1'), cell('Received', 'width:124px'));
  }

  private renderList(): void {
    const clip = 'overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:0 4px';
    this.rows = new Map(
      mails.map((mail) => {
        const selected = mail === this.selected;
        const weight = this.unread.has(mail) ? 'font-weight:bold;' : '';
        const row = h(
          'div',
          {
            class: 'pc-row',
            style: `${weight}${selected ? 'background:#22356f;color:#fff' : ''}`,
            onClick: () => this.show(mail),
          },
          h('div', { style: `width:136px;${clip}` }, mail.from),
          h('div', { style: `flex:1;${clip}` }, mail.subject),
          h('div', { style: `width:124px;${clip}` }, mail.received),
        );
        return [mail, row];
      }),
    );
    this.list.replaceChildren(...this.rows.values());
    this.status.textContent = `Total messages: ${mails.length}   Unread: ${this.unread.size}`;
  }

  private show(mail: Mail): void {
    this.selected = mail;
    this.unread.delete(mail);
    if (mail.sets) this.pc.state.setFlag(mail.sets);
    const field = (name: string, value: string) => h('div', null, h('b', { style: 'display:inline-block;width:72px' }, name), value);
    this.reader.content.replaceChildren(
      h(
        'div',
        { style: 'padding:4px 6px;border-bottom:1px solid #807b6f;background:#ece8dc' },
        field('From:', mail.address),
        field('To:', '(you)'),
        field('Date:', mail.date),
        field('Subject:', mail.subject),
      ),
      h('pre', { style: 'margin:0;padding:6px 8px 12px;font:inherit;white-space:pre-wrap' }, mail.body),
    );
    this.reader.scrollTo(0);
    this.renderList();
  }

  private checkSpamEnd(): void {
    if (this.thoughtShown || this.selected !== mails[1] || !this.reader.atEnd) return;
    this.thoughtShown = true;
    void this.pc.ctx.dialogue(dialogues.home_spam);
  }
}
