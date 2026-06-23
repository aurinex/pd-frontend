import { Box, Typography, Card, Accordion, AccordionSummary, AccordionDetails, Grid, keyframes } from "@mui/material";
import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useUser } from "../../utils/UserContext";
import { getAnnouncements } from "../../services/announcementService";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArticleIcon from "@mui/icons-material/Article";
import GavelIcon from "@mui/icons-material/Gavel";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DescriptionIcon from "@mui/icons-material/Description";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import InfoIcon from "@mui/icons-material/Info";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const references = [
  {
    icon: <ArticleIcon />,
    title: "Как подать обращение",
    content: "Для подачи обращения нажмите «Подать обращение» в верхнем меню. Заполните тему, категорию, текст обращения и при необходимости прикрепите файлы. После отправки вы сможете отслеживать статус в разделе «Мои обращения».",
  },
  {
    icon: <GavelIcon />,
    title: "Категории обращений",
    content: "Жалоба — на действия/бездействие сотрудников. Заявление — просьба о содействии. Предложение — по улучшению работы. Сообщение о преступлении — информация о готовящемся или совершённом преступлении.",
  },
  {
    icon: <ScheduleIcon />,
    title: "Сроки рассмотрения",
    content: "Обращения рассматриваются в срок до 30 дней с момента регистрации. В исключительных случаях срок может быть продлён до 30 дополнительных дней с уведомлением заявителя.",
  },
  {
    icon: <DescriptionIcon />,
    title: "Необходимые документы",
    content: "Для идентификации достаточно учётной записи в системе. При необходимости сотрудник может запросить дополнительные документы через ответ на обращение.",
  },
  {
    icon: <ContactMailIcon />,
    title: "Контакты",
    content: "По вопросам работы системы обращаться в дежурную часть или по телефону доверия МВД. Контактные данные вашего территориального органа доступны на официальном сайте.",
  },
  {
    icon: <InfoIcon />,
    title: "Права заявителя",
    content: "Вы имеете право получать информацию о ходе рассмотрения, приносить дополнительные материалы, обжаловать принятое решение, обращаться с ходатайством о продлении срока.",
  },
];

export const DashboardPage = () => {
  const theme = useTheme();
  const { user, isOfficer, isAdmin } = useUser();
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    getAnnouncements()
      .then(setAnnouncements)
      .catch(() => {});
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 4, pl: { md: 8 } }}>
      <Box sx={{ animation: `${fadeIn} 0.3s ease forwards`, display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <LocalPoliceIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {isOfficer ? "Панель управления" : "Личный кабинет"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Добро пожаловать, {user?.surname} {user?.name}
          </Typography>
        </Box>
      </Box>

      {isOfficer && (
        <Box sx={{ animation: `${fadeIn} 0.3s 0.05s ease forwards`, opacity: 0 }}>
          <Card sx={{ p: 4, mb: 3, background: theme.palette.background.fourth, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Добро пожаловать в систему
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Используйте раздел «Управление» для просмотра и обработки обращений граждан.
              Здесь отображаются актуальные объявления и новости.
            </Typography>
          </Card>
        </Box>
      )}

      {!isOfficer && !isAdmin && (
        <Box sx={{ animation: `${fadeIn} 0.3s 0.05s ease forwards`, opacity: 0 }}>
          <Card sx={{ p: 3, background: theme.palette.background.fourth, borderRadius: 1, mb: 3 }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {[
                { label: "Подать обращение", desc: "Создать новое обращение", path: "/create" },
                { label: "Мои обращения", desc: "Отслеживать статус", path: "/appeals" },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    flex: 1, minWidth: 180, p: 2.5, borderRadius: 1, cursor: "pointer",
                    background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                    "&:hover": { background: theme.palette.action.hover },
                    transition: "background 0.2s",
                  }}
                  onClick={() => window.location.href = item.path}
                >
                  <Typography variant="subtitle2" fontWeight={600}>{item.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>
      )}

      {!isOfficer && !isAdmin && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ animation: `${fadeIn} 0.3s 0.1s ease forwards`, opacity: 0 }}>
              <Card sx={{ p: 3, background: theme.palette.background.fourth, borderRadius: 1, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ArticleIcon fontSize="small" /> Справочные материалы
                </Typography>
                {references.map((ref, i) => (
                  <Accordion
                    key={i}
                    disableGutters
                    sx={{
                      background: "transparent",
                      boxShadow: "none",
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      "&:before": { display: "none" },
                      "&.Mui-expanded": { margin: 0 },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 48, "&.Mui-expanded": { minHeight: 48 } }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{ color: theme.palette.primary.main, display: "flex" }}>{ref.icon}</Box>
                        <Typography variant="body2" fontWeight={500}>{ref.title}</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0, pb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {ref.content}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Card>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ animation: `${fadeIn} 0.3s 0.15s ease forwards`, opacity: 0 }}>
              <Card sx={{ p: 3, background: theme.palette.background.fourth, borderRadius: 1, position: "sticky", top: 80 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Объявления</Typography>
                {announcements.length === 0 && (
                  <Typography variant="body2" color="text.secondary">Пока нет объявлений</Typography>
                )}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {announcements.map((a) => (
                    <Box key={a._id} sx={{
                      p: 2, borderRadius: 1,
                      background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    }}>
                      <Typography variant="subtitle2" fontWeight={600}>{a.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {a.created_at ? format(new Date(a.created_at), "dd MMM", { locale: ru }) : ""}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>{a.content}</Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Box>
          </Grid>
        </Grid>
      )}

    </Box>
  );
};
