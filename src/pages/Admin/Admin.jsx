import { useEffect, useMemo, useState } from "react";
import "./Admin.css";
import {getAllFitnessObjects, createFitnessObject, updateFitnessObject, deleteFitnessObject} from "../../services/fitnessObjectService";
import { registerEmployee, getAllEmployees, deleteEmployee } from "../../services/employeeService";
import { getAllMembershipCards } from "../../services/cardService";
import { getStatistics } from "../../services/statisticsService";
import { getAllPenaltyCards, getAllPenaltyPoints, cancelPenalty, deletePenalty } from "../../services/penaltyService";

const initialFormState = {
  name: "",
  address: "",
  city: "",
  capacity: "",
  workingHours: "",
};

const initialEmployeeFormState = {
  firstName: "",
  lastName: "",
  address: "",
  email: "",
  password: "",
  license: "",
  employeeType: "",
};

const initialDailyCardFormState = {
  cardNumber: "",
  fitnessObjectIds: [],
  purchaseDate: "",
};

const initialSubscriptionCardFormState = {
  cardNumber: "",
  validFrom: "",
  validTo: "",
  personalTrainer: false,
  memberId: "",
};

const Admin = () => {
  const [fitnessObjects, setFitnessObjects] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [employeeFormData, setEmployeeFormData] = useState(
    initialEmployeeFormState
  );
  const [employeeSubmitLoading, setEmployeeSubmitLoading] = useState(false);
  const [employeeMessage, setEmployeeMessage] = useState("");
  const [employeeError, setEmployeeError] = useState("");

  const [dailyCardFormData, setDailyCardFormData] = useState(
    initialDailyCardFormState
  );
  const [dailyCardSubmitLoading, setDailyCardSubmitLoading] = useState(false);
  const [dailyCardMessage, setDailyCardMessage] = useState("");
  const [dailyCardError, setDailyCardError] = useState("");

  const [subscriptionCardFormData, setSubscriptionCardFormData] = useState(
    initialSubscriptionCardFormState
  );
  const [subscriptionCardSubmitLoading, setSubscriptionCardSubmitLoading] =
    useState(false);
  const [subscriptionCardMessage, setSubscriptionCardMessage] = useState("");
  const [subscriptionCardError, setSubscriptionCardError] = useState("");

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const [cards, setCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  const [showObjects, setShowObjects] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showEmployees, setShowEmployees] = useState(false);
  
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [penalties, setPenalties] = useState([]);
  const [penaltiesLoading, setPenaltiesLoading] = useState(false);
  const [showPenalties, setShowPenalties] = useState(false);

  const loadFitnessObjects = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllFitnessObjects();
      setFitnessObjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Greška pri učitavanju objekata.");
    } finally {
      setLoading(false);
    }
  };

  const loadCards = async () => {
    try {
      setCardsLoading(true);
      const data = await getAllMembershipCards();
      setCards(Array.isArray(data) ? data : []);
    } catch(err) {
      console.error(err);
    } finally {
      setCardsLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const data = await getAllEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Da li si siguran da želiš da obrišeš zaposlenog?")) return;
    try {
      await deleteEmployee(id);
      loadEmployees(); // Ponovno učitavanje
      alert("Zaposleni uspešno obrisan.");
    } catch (err) {
      alert("Došlo je do greške prilikom brisanja zaposlenog.");
      console.error(err);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getStatistics();
      setStats(data);
    } catch(err) { console.error(err); }
    finally { setStatsLoading(false); }
  };

  const loadPenalties = async () => {
    try {
      setPenaltiesLoading(true);
      const c = await getAllPenaltyCards();
      const p = await getAllPenaltyPoints();
      const mappedCards = (Array.isArray(c) ? c : []).map(x => ({...x, type: 'Card'}));
      const mappedPoints = (Array.isArray(p) ? p : []).map(x => ({...x, type: 'Point'}));
      setPenalties([...mappedCards, ...mappedPoints].sort((a,b) => new Date(b.date) - new Date(a.date)));
    } catch(err) { console.error(err); }
    finally { setPenaltiesLoading(false); }
  };

  const handleCancelPenalty = async (id, type) => {
    const reason = window.prompt("Unesi napomenu za storniranje (obavezno):");
    if (!reason || !reason.trim()) {
      alert("Napomena je obavezna za storniranje.");
      return;
    }
    try {
      await cancelPenalty(id, type, reason);
      loadPenalties();
      loadStats();
      alert("Kazna uspešno stornirana.");
    } catch (err) {
      alert(err.message || "Greška pri storniranju.");
    }
  };

  const handleDeletePenaltyCard = async (id, type) => {
    const confirmed = window.confirm("Da li si siguran da želiš trajno da obrišeš ovu kaznu iz baze?");
    if (!confirmed) return;
    try {
      await deletePenalty(id, type);
      loadPenalties();
      loadStats();
      alert("Kazna uspešno izbrisana iz baze.");
    } catch (err) {
      alert(err.message || "Greška pri brisanju.");
    }
  };

  useEffect(() => {
    loadFitnessObjects();
    loadCards();
    loadEmployees();
    loadStats();
    loadPenalties();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? value.replace(/\D/g, "") : value,
    }));
  };

  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;
    setEmployeeFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDailyCardChange = (e) => {
    const { name, value, type, checked, options } = e.target;

    if (name === "fitnessObjectIds" && options) {
      const selectedValues = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => Number(option.value));

      setDailyCardFormData((prev) => ({
        ...prev,
        fitnessObjectIds: selectedValues,
      }));
      return;
    }

    setDailyCardFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubscriptionCardChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSubscriptionCardFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  const resetEmployeeForm = () => {
    setEmployeeFormData(initialEmployeeFormState);
  };

  const resetDailyCardForm = () => {
    setDailyCardFormData(initialDailyCardFormState);
  };

  const resetSubscriptionCardForm = () => {
    setSubscriptionCardFormData(initialSubscriptionCardFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      capacity: Number(formData.capacity),
      workingHours: formData.workingHours.trim(),
    };

    if (
      !payload.name ||
      !payload.address ||
      !payload.city ||
      !payload.workingHours ||
      !payload.capacity
    ) {
      setError("Popuni sva polja.");
      return;
    }

    try {
      setSubmitLoading(true);

      if (isEditing) {
        await updateFitnessObject({
          id: editingId,
          ...payload,
        });
        setMessage("Objekat je uspešno izmenjen.");
      } else {
        await createFitnessObject(payload);
        setMessage("Objekat je uspešno dodat.");
      }

      resetForm();
      await loadFitnessObjects();
    } catch (err) {
      setError(err.message || "Greška pri čuvanju objekta.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setEmployeeMessage("");
    setEmployeeError("");

    const payload = {
      firstName: employeeFormData.firstName.trim(),
      lastName: employeeFormData.lastName.trim(),
      address: employeeFormData.address.trim(),
      email: employeeFormData.email.trim(),
      password: employeeFormData.password.trim(),
      license: employeeFormData.license.trim(),
      employeeType: employeeFormData.employeeType ? Number(employeeFormData.employeeType) : 0,
    };

    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.address ||
      !payload.email ||
      !payload.password ||
      !payload.license ||
      payload.employeeType === undefined || payload.employeeType === ""
    ) {
      setEmployeeError("Popuni sva polja za zaposlenog.");
      return;
    }

    try {
      setEmployeeSubmitLoading(true);
      await registerEmployee(payload);
      setEmployeeMessage("Zaposleni je uspešno registrovan.");
      resetEmployeeForm();
      loadEmployees(); // Refresh employees list after registration
    } catch (err) {
      setEmployeeError(err.message || "Greška pri registraciji zaposlenog.");
    } finally {
      setEmployeeSubmitLoading(false);
    }
  };

  const handleDailyCardSubmit = async (e) => {
    e.preventDefault();
    setDailyCardMessage("");
    setDailyCardError("");

    const payload = {
      cardNumber: dailyCardFormData.cardNumber.trim(),
      fitnessObjectIds: dailyCardFormData.fitnessObjectIds,
      purchaseDate: dailyCardFormData.purchaseDate || null,
    };

    if (!payload.cardNumber) {
      setDailyCardError("Unesi broj kartice.");
      return;
    }

    try {
      setDailyCardSubmitLoading(true);
      await createDailyCard(payload);
      setDailyCardMessage("Dnevna kartica je uspešno dodata.");
      resetDailyCardForm();
    } catch (err) {
      setDailyCardError(err.message || "Greška pri dodavanju dnevne kartice.");
    } finally {
      setDailyCardSubmitLoading(false);
    }
  };

  const handleSubscriptionCardSubmit = async (e) => {
    e.preventDefault();
    setSubscriptionCardMessage("");
    setSubscriptionCardError("");

    const payload = {
      cardNumber: subscriptionCardFormData.cardNumber.trim(),
      validFrom: subscriptionCardFormData.validFrom || null,
      validTo: subscriptionCardFormData.validTo || null,
      personalTrainer: subscriptionCardFormData.personalTrainer,
      memberId: subscriptionCardFormData.memberId
        ? Number(subscriptionCardFormData.memberId)
        : null,
    };

    if (!payload.cardNumber) {
      setSubscriptionCardError("Unesi broj kartice.");
      return;
    }

    if (
      payload.validFrom &&
      payload.validTo &&
      new Date(payload.validTo) <= new Date(payload.validFrom)
    ) {
      setSubscriptionCardError(
        "Datum isteka mora biti posle datuma početka."
      );
      return;
    }

    try {
      setSubscriptionCardSubmitLoading(true);
      await createSubscriptionCard(payload);
      setSubscriptionCardMessage("Pretplatna kartica je uspešno dodata.");
      resetSubscriptionCardForm();
    } catch (err) {
      setSubscriptionCardError(
        err.message || "Greška pri dodavanju pretplatne kartice."
      );
    } finally {
      setSubscriptionCardSubmitLoading(false);
    }
  };

  const handleEdit = (objectItem) => {
    setEditingId(objectItem.id);
    setFormData({
      name: objectItem.name || "",
      address: objectItem.address || "",
      city: objectItem.city || "",
      capacity: objectItem.capacity?.toString() || "",
      workingHours: objectItem.workingHours || "",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Da li sigurno želiš da obrišeš objekat?");
    if (!confirmed) return;

    try {
      setError("");
      setMessage("");
      await deleteFitnessObject(id);
      setMessage("Objekat je uspešno obrisan.");
      if (editingId === id) {
        resetForm();
      }
      await loadFitnessObjects();
    } catch (err) {
      setError(err.message || "Greška pri brisanju objekta.");
    }
  };

  return (
    <div className="admin">
      <div className="admin-hero">
        <div>
          <p className="admin-kicker">FlexFit Control Center</p>
          <h1>Admin panel</h1>
          <p className="admin-subtitle">
            Upravljaj objektima, zaposlenima i narednim funkcionalnostima iz
            jednog mesta.
          </p>
        </div>
      </div>

      <div className="admin-layout">
        <section className="admin-form-card">
          <div className="section-heading">
            <span className="section-dot blue"></span>
            <h2>{isEditing ? "Izmeni objekat" : "Dodaj objekat"}</h2>
          </div>

          <form className="admin-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Naziv objekta"
              value={formData.name}
              onChange={handleChange}
            />

            <input
              type="text"
              name="address"
              placeholder="Adresa"
              value={formData.address}
              onChange={handleChange}
            />

            <input
              type="text"
              name="city"
              placeholder="Grad"
              value={formData.city}
              onChange={handleChange}
            />

            <input
              type="text"
              name="capacity"
              placeholder="Kapacitet"
              value={formData.capacity}
              onChange={handleChange}
            />

            <input
              type="text"
              name="workingHours"
              placeholder="Radno vreme"
              value={formData.workingHours}
              onChange={handleChange}
            />

            <div className="admin-form-actions">
              <button
                type="submit"
                className="primary-btn"
                disabled={submitLoading}
              >
                {submitLoading
                  ? "Sačekaj..."
                  : isEditing
                  ? "Sačuvaj izmene"
                  : "Dodaj objekat"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  Otkaži izmenu
                </button>
              )}
            </div>
          </form>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </section>

        <section className="admin-list-card">
          <div className="admin-list-header">
            <div className="section-heading">
              <span className="section-dot purple"></span>
              <h2>Objekti</h2>
            </div>

            <div style={{display: "flex", gap: "10px"}}>
              <button
                className="refresh-btn"
                onClick={() => setShowObjects(!showObjects)}
              >
                {showObjects ? "Sakrij objekte" : "Prikaži objekte"}
              </button>
              <button
                className="refresh-btn"
                onClick={loadFitnessObjects}
                disabled={loading}
              >
                {loading ? "Učitavanje..." : "Osveži"}
              </button>
            </div>
          </div>

          {showObjects && (
            loading ? (
              <p className="admin-empty-state">Učitavanje objekata...</p>
            ) : fitnessObjects.length === 0 ? (
              <p className="admin-empty-state">Nema dodatih objekata.</p>
            ) : (
              <div className="fitness-object-list">
              {fitnessObjects.map((objectItem) => (
                <div className="fitness-object-card" key={objectItem.id}>
                  <div className="fitness-card-top">
                    <h3>{objectItem.name}</h3>
                    <span className="city-badge">{objectItem.city}</span>
                  </div>

                  <div className="fitness-object-info">
                    <p>
                      <strong>Adresa:</strong> {objectItem.address}
                    </p>
                    <p>
                      <strong>Kapacitet:</strong> {objectItem.capacity}
                    </p>
                    <p>
                      <strong>Radno vreme:</strong> {objectItem.workingHours}
                    </p>
                  </div>

                  <div className="fitness-object-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(objectItem)}
                    >
                      Izmeni
                    </button>
                    <button
                      className="danger-btn"
                      onClick={() => handleDelete(objectItem.id)}
                    >
                      Obriši
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
          )}
        </section>
      </div>

      <div className="admin-bottom-grid">
        <section className="admin-card">
          <div className="section-heading">
            <span className="section-dot green"></span>
            <h2>Dodaj zaposlenog</h2>
          </div>

          <form className="admin-form" onSubmit={handleEmployeeSubmit}>
            <input
              type="text"
              name="firstName"
              placeholder="Ime"
              value={employeeFormData.firstName}
              onChange={handleEmployeeChange}
            />

            <input
              type="text"
              name="lastName"
              placeholder="Prezime"
              value={employeeFormData.lastName}
              onChange={handleEmployeeChange}
            />

            <input
              type="text"
              name="address"
              placeholder="Adresa"
              value={employeeFormData.address}
              onChange={handleEmployeeChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={employeeFormData.email}
              onChange={handleEmployeeChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Lozinka"
              value={employeeFormData.password}
              onChange={handleEmployeeChange}
            />

            <input
              type="text"
              name="license"
              placeholder="Licenca"
              value={employeeFormData.license}
              onChange={handleEmployeeChange}
            />

            <select
              name="employeeType"
              value={employeeFormData.employeeType}
              onChange={handleEmployeeChange}
            >
              <option value="" disabled>Izaberi tip zaposlenog</option>
              <option value="0">Instruktor</option>
              <option value="1">Redar</option>
            </select>

            <div className="admin-form-actions">
              <button
                type="submit"
                className="primary-btn green-btn"
                disabled={employeeSubmitLoading}
              >
                {employeeSubmitLoading ? "Sačekaj..." : "Registruj zaposlenog"}
              </button>
            </div>
          </form>

          {employeeMessage && (
            <p className="success-message">{employeeMessage}</p>
          )}
          {employeeError && <p className="error-message">{employeeError}</p>}
        </section>

        <section className="admin-list-card" style={{gridColumn: "1 / -1"}}>
          <div className="admin-list-header">
            <div className="section-heading">
              <span className="section-dot orange"></span>
              <h2>Svi Zaposleni</h2>
            </div>
            <div style={{display: "flex", gap: "10px"}}>
              <button
                className="refresh-btn"
                onClick={() => setShowEmployees(!showEmployees)}
              >
                {showEmployees ? "Sakrij zaposlene" : "Prikaži zaposlene"}
              </button>
              <button
                className="refresh-btn"
                onClick={loadEmployees}
                disabled={employeesLoading}
              >
                {employeesLoading ? "Učitavanje..." : "Osveži"}
              </button>
            </div>
          </div>
          {showEmployees && (
            employeesLoading ? (
               <p className="admin-empty-state">Učitavanje zaposlenih...</p>
            ) : employees.length === 0 ? (
               <p className="admin-empty-state">Nema kreiranih zaposlenih.</p>
            ) : (
               <div className="fitness-object-list" style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem"}}>
                 {employees.map((emp) => (
                   <div className="fitness-object-card" key={emp.id} style={{padding: "1rem", backgroundColor: "#1e293b", position: "relative"}}>
                     <button 
                       onClick={() => handleDeleteEmployee(emp.id)}
                       style={{position: "absolute", top: "10px", right: "10px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", cursor: "pointer"}}
                     >
                       Obriši
                     </button>
                     <h3 style={{marginBottom: "0.5rem"}}>{emp.firstName} {emp.lastName}</h3>
                     <p style={{color: "#94a3b8", fontSize: "0.9rem", marginBottom: "0.25rem"}}>Uloga: {emp.employeeType === 0 ? "Instruktor" : "Redar"}</p>
                     <p style={{color: "#94a3b8", fontSize: "0.9rem", marginBottom: "0.25rem"}}>Email: {emp.email}</p>
                     <p style={{color: "#94a3b8", fontSize: "0.9rem"}}>Licenca: {emp.license || "Nema"}</p>
                   </div>
                 ))}
               </div>
            )
          )}
        </section>


        <section className="admin-list-card" style={{gridColumn: "1 / -1"}}>
          <div className="admin-list-header">
            <div className="section-heading">
              <span className="section-dot purple"></span>
              <h2>Sve Kartice</h2>
            </div>

            <div style={{display: "flex", gap: "10px"}}>
              <button
                className="refresh-btn"
                onClick={() => setShowCards(!showCards)}
              >
                {showCards ? "Sakrij kartice" : "Prikaži kartice"}
              </button>
              <button
                className="refresh-btn"
                onClick={loadCards}
                disabled={cardsLoading}
              >
                {cardsLoading ? "Učitavanje..." : "Osveži"}
              </button>
            </div>
          </div>

          {showCards && (
            cardsLoading ? (
              <p className="admin-empty-state">Učitavanje kartica...</p>
            ) : cards.length === 0 ? (
              <p className="admin-empty-state">Nema izdatih kartica.</p>
            ) : (
              <div className="fitness-object-list" style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem"}}>
              {cards.map((c) => (
                <div className="fitness-object-card" key={c.id || c.cardNumber}>
                  <div className="fitness-card-top">
                    <h3>{c.cardNumber}</h3>
                    <span className="city-badge">{c.validFrom !== undefined ? 'Pretplatna' : 'Dnevna'}</span>
                  </div>
                  <div className="fitness-object-info">
                    {c.validFrom !== undefined ? (
                      <>
                        <p><strong>Član ID:</strong> {c.memberId}</p>
                        <p><strong>Važi od:</strong> {c.validFrom ? new Date(c.validFrom).toLocaleDateString() : 'Još nije aktivirana'}</p>
                        <p><strong>Važi do:</strong> {c.validTo ? new Date(c.validTo).toLocaleDateString() : 'Još nije aktivirana'}</p>
                      </>
                    ) : (
                      <>
                        <p><strong>Kupljena:</strong> {c.purchaseDate ? new Date(c.purchaseDate).toLocaleDateString() : 'Sada'}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
          )}
        </section>

        <section className="admin-list-card" style={{gridColumn: "1 / -1"}}>
          <div className="admin-list-header">
            <div className="section-heading">
              <span className="section-dot orange"></span>
              <h2>Sve Kazne i Poeni</h2>
            </div>

            <div style={{display: "flex", gap: "10px"}}>
              <button
                className="refresh-btn"
                onClick={() => setShowPenalties(!showPenalties)}
              >
                {showPenalties ? "Sakrij kazne" : "Prikaži kazne"}
              </button>
              <button
                className="refresh-btn"
                onClick={loadPenalties}
                disabled={penaltiesLoading}
              >
                {penaltiesLoading ? "Učitavanje..." : "Osveži"}
              </button>
            </div>
          </div>

          {showPenalties && (
            penaltiesLoading ? (
              <p className="admin-empty-state">Učitavanje kazni...</p>
            ) : penalties.length === 0 ? (
              <p className="admin-empty-state">Nema evidentiranih kazni.</p>
            ) : (
              <div className="fitness-object-list" style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem"}}>
              {penalties.map((p, idx) => (
                <div className="fitness-object-card" key={idx} style={{opacity: p.isCanceled ? 0.6 : 1}}>
                  <div className="fitness-card-top">
                    <h3>{p.type === 'Card' ? 'Kaznena Karta' : 'Kazneni Poen'}</h3>
                    <span className="city-badge" style={{background: p.isCanceled ? '#64748b' : '#ef4444'}}>
                      {p.isCanceled ? 'Stornirano' : 'Aktivno'}
                    </span>
                  </div>
                  <div className="fitness-object-info">
                    <p><strong>Član ID:</strong> {p.memberId}</p>
                    <p><strong>Datum:</strong> {new Date(p.date).toLocaleDateString()} {new Date(p.date).toLocaleTimeString()}</p>
                    <p><strong>Razlog:</strong> {p.reason || p.description}</p>
                    {p.type === 'Card' && <p><strong>Cena:</strong> {p.price} RSD</p>}
                    
                    {p.isCanceled && (
                      <p style={{marginTop: '0.5rem', color: '#fbbf24'}}><strong>Napomena:</strong> {p.cancelReason}</p>
                    )}
                    
                    {!p.isCanceled && (
                      <button 
                        onClick={() => handleCancelPenalty(p.id, p.type)}
                        style={{marginTop: "1rem", width: "100%", backgroundColor: "#334155", color: "white", border: "1px solid #475569", borderRadius: "4px", padding: "8px", cursor: "pointer"}}
                      >
                        Storniraj (uz napomenu)
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeletePenaltyCard(p.id, p.type)}
                      style={{marginTop: "0.5rem", width: "100%", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", padding: "8px", cursor: "pointer"}}
                    >
                      Trajno Obriši
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
          )}
        </section>

        <section className="admin-card stats-card" style={{gridColumn: "1 / -1"}}>
          <div className="admin-list-header">
            <div className="section-heading">
              <span className="section-dot green"></span>
              <h2>Statistika i Finansije</h2>
            </div>
            <button className="refresh-btn" onClick={loadStats} disabled={statsLoading}>
              Osveži
            </button>
          </div>

          {statsLoading || !stats ? (
             <p className="admin-empty-state">Učitavanje statistike...</p>
          ) : (
             <div style={{display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap'}}>
               <div style={{flex: 1, backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '8px', minWidth: '200px'}}>
                  <p style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem'}}>Aktivnih Članova</p>
                  <h3 style={{fontSize: '2rem', color: 'white'}}>{stats.totalActiveMembers}</h3>
               </div>
               <div style={{flex: 1, backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '8px', minWidth: '200px'}}>
                  <p style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem'}}>Ukupno Pretplatnih Kartica</p>
                  <h3 style={{fontSize: '2rem', color: 'white'}}>{stats.totalSubscriptionCards}</h3>
               </div>
               <div style={{flex: 1, backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '8px', minWidth: '200px'}}>
                  <p style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem'}}>Ukupno Dnevnih Kartica</p>
                  <h3 style={{fontSize: '2rem', color: 'white'}}>{stats.totalDailyCards}</h3>
               </div>
               <div style={{flex: 1, backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '8px', minWidth: '200px'}}>
                  <p style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem'}}>Prihod od Kazni</p>
                  <h3 style={{fontSize: '2rem', color: '#22c55e'}}>{stats.totalPenaltyRevenue} RSD</h3>
               </div>
             </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Admin;