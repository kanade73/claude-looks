# looks

Claude Code のデスクトップアプリ・モバイルアプリの画面を、動く背景つきのテーマに着せ替える mod です。

| テーマ | 中身 |
| --- | --- |
| `christmas` | 雪の降る夜。電飾のツリーと雪だるま、明かりの灯る家、空を走るソリ、上端のガーランド |
| `cosmos` | 宇宙。またたく星、流れ星、ロケットと UFO、輪のある惑星、ブラックホール |

`/look christmas` や `/look cosmos` で切り替えます。`/look` だけ打つと、今のテーマと選べるテーマの一覧が出ます。選んだテーマは次のセッションにも引き継がれます。

ターミナルや VS Code にはテーマが表示されません。

## インストール

ターミナルの Claude Code のプロンプトで:

```
/plugin install looks --marketplace kanade73/claude-looks
```

`Add marketplace?` と聞かれたら `y`、続けてスコープを選びます（いちばん上のユーザースコープなら、どのセッションでも使えます）。

シェルからなら:

```bash
claude plugin install looks --marketplace kanade73/claude-looks
```

デスクトップアプリでは `/plugin` が使えないので、プロンプト欄の横の + から Plugins を開き、Add marketplace に `kanade73/claude-looks` を入れてから Add plugin を押します。

## テーマを増やすには

`hooks/` に配色と背景 SVG を書いたファイルを足し、`hooks/register.tsx` の `LOOKS` に1行加えます。背景 SVG では `@media` と `<text>` を使わないでください（アプリで背景のアニメーションが止まります）。要素ごとの `style` 属性も効かないので、動きの速さは `<style>` 内のクラスか SMIL（`<animate>`）で指定します。
