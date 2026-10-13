# Idea Parking Lot moderation

The public board reads open GitHub issues with the `idea-lot:approved` label. New submissions use the `idea-lot:pending` label when that label exists.

Create these repository labels before opening the board:

- `idea-lot:pending`
- `idea-lot:approved`

Optional labels help filtering and review but are not required because the page also reads the issue form fields:

- `bug`
- `game-feedback`
- `site-feedback`
- `community-idea`
- `MO1`
- `MO2`

## Review path

1. Check that the issue contains no personal information, private evidence, cheating accusation, harassment report, active exploit instructions, or account details.
2. Search for duplicates. Close or link duplicates instead of approving both.
3. Ask for clarification when the title or summary is too vague.
4. Add `idea-lot:approved` and remove `idea-lot:pending` when the post is ready for the board.
5. Close the issue or remove `idea-lot:approved` to remove it from the live board.

The board counts only GitHub thumbs-up reactions as likes. It does not display negative reactions. Popular sorting ranks by thumbs-up count, then comments, then publication date.
