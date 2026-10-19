# Dépannage des agents Ludea (pour Jean-Louis)

Tout le système est dans ce dépôt. Si quelque chose ne marche plus, voici quoi faire, du plus simple
au plus complet.

## Je veux savoir si tout tourne
Ouvre une session Claude Code sur **`ludea-ai/agents`** et tape **`/check-agents`**.
Elle te dit, agent par agent : a-t-il tourné cette nuit, qu'attend-il de toi, et où répondre.

Chaque matin vers 07:10, l'agent de surveillance le vérifie aussi tout seul. Il ne t'écrit que
s'il y a un problème.

## Un agent n'a pas tourné (pas de résumé le matin)
1. L'agent de surveillance a déjà relancé l'agent une fois. Attends sa notification.
2. Toujours rien : ouvre une session sur `ludea-ai/agents` et tape **`/install-agents`**.
   La commande compare ce qui doit tourner (les fichiers du dépôt) à ce qui tourne vraiment
   (claude.ai), recrée ce qui manque et vérifie que chaque agent a bien accès à GitHub.
3. Elle te dit si un dépôt est refusé à un agent. Dans ce cas, il faut autoriser ce dépôt dans les
   réglages GitHub de Claude ; la commande te donne le lien.

## J'ai tout perdu (sessions supprimées, compte changé…)
Même chose : une session sur `ludea-ai/agents`, puis **`/install-agents`**. Elle recrée les trois
sessions et les trois tâches programmées à partir des fichiers. Rien d'autre n'est à reconstituer :
les consignes, les procédures et l'historique des passages sont dans ce dépôt.

## Je veux changer ce que fait un agent ou son heure
Demande-le dans une session sur `ludea-ai/agents`. Le changement est fait dans les fichiers
(`agents/…`, `procedures/…`), enregistré, puis appliqué avec `/install-agents`.
Ne modifie jamais les consignes directement dans claude.ai : elles seraient écrasées à la prochaine
installation, et le dépôt ne refléterait plus la réalité.

## Où répondre aux agents
- **« OK »** pour une mise à jour du moteur : dans la session « Ludea – agent moteur (signalements) ».
- **« publie <jeu> »** : dans la session « Ludea – agent catalogue (publications) ».
- Ou sur GitHub : `OK` en commentaire sur la PR du moteur, `/accept` sur la demande de publication.

## Pièges connus
- Une tâche programmée qui crée **une nouvelle session à chaque fois** démarre sans accès aux
  dépôts : l'agent s'arrête au bout de 30 secondes. C'est ce qui s'est passé la nuit du
  19 octobre 2026. On utilise toujours une session permanente, réveillée par la tâche programmée.
- Une session ne peut pas créer de dépôt sur GitHub : c'est toi qui le crées sur github.com.
